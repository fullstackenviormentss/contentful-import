import { join } from 'path'

import { createClient } from 'contentful-management'

import runContentfulImport from '../../dist/index'

const managementToken = process.env.MANAGEMENT_TOKEN
const orgId = process.env.ORG_ID
const sampleSpaceFile = join(__dirname, 'sample-space.json')

let spaceHandle

jest.setTimeout(60000)

afterAll(() => {
  return spaceHandle.delete()
})

test('It should import a space properly when used as a lib', () => {
  const client = createClient({ accessToken: managementToken })
  return client.createSpace({name: 'temp contentful-import space'}, orgId)
    .then((space) => {
      spaceHandle = space
      return runContentfulImport({
        spaceId: space.sys.id,
        managementToken,
        contentFile: sampleSpaceFile,
        useVerboseRenderer: true
      })
        .catch((multierror) => {
          const failedPublishErrors = multierror.errors.filter((error) => error.hasOwnProperty('error') && error.error.message.indexOf('Could not publish the following entities') !== -1)
          expect(failedPublishErrors).toHaveLength(0)
          return space.delete()
        })
        .then(() => {
          return space.delete()
        })
    })
})
