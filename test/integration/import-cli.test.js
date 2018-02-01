import { resolve } from 'path'

import nixt from 'nixt'
import { createClient } from 'contentful-management'

jest.setTimeout(15000)

const bin = resolve(__dirname, '..', '..', 'bin')
const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful-import').clone()
}

const managementToken = process.env.MANAGEMENT_TOKEN
const orgId = process.env.ORG_ID

test('It should import space properly when running as a cli', (done) => {
  const client = createClient({accessToken: managementToken})
  client.createSpace({name: 'temp contentful-import space'}, orgId)
    .then((space) => {
      app()
        .run(` --space-id ${space.sys.id} --management-token ${managementToken} --content-file ${resolve(__dirname, 'sample-space.json')}`)
        .stdout(/The following entities are going to be imported/)
        .stdout(/Content Types {13}| 3/)
        .stdout(/Editor Interfaces {9}| 3/)
        .stdout(/Entries {19}| 6/)
        .stdout(/Assets {20}| 6/)
        .stdout(/Locales {19}| 1/)
        .stdout(/Webhooks {18}| 0/)
        .expect((result) => {
          if (result.stderr.length) {
            throw new Error('Should not have stderr output.')
          }
        })
        .end((error) => {
          expect(error).toBe(undefined)
          space.delete()
            .then(done)
        })
    })
})
