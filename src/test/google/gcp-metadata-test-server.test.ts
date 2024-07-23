import fs from 'fs'
import * as gcpMetadata from 'gcp-metadata'
import { google } from 'googleapis'

import { GcpMetaDataTestServer } from './gcp-metadata-test-server'

const localhostCertificate = fs.readFileSync(`src/test/kubernetes/resources/localhost.crt`)
const localhostPrivateKey = fs.readFileSync(`src/test/kubernetes/resources/localhost.key`)

describe('GcpMetaDataTestServer', () => {
  const gcpMetaDataTestServer = new GcpMetaDataTestServer({
    cert: localhostCertificate,
    key: localhostPrivateKey
  })

  beforeAll(async () => {
    await gcpMetaDataTestServer.start()
    process.env.GCE_METADATA_HOST = gcpMetaDataTestServer.listenUrl
    process.env.METADATA_SERVER_DETECTION = 'assume-present'
    process.env.PATH = '' // Make sure the libs it can't call gcloud so
  })

  afterAll(async () => {
    await gcpMetaDataTestServer.stop()
  })

  it('should start and the listenUrl should not be empty', async () => {
    expect(gcpMetaDataTestServer.listenUrl).not.toBe('')
  })

  it('should return this is a kubernetes environment', async () => {
    await expect(gcpMetadata.instance('attributes/cluster-name')).resolves.toBe('kubernetes')
    await expect(gcpMetadata.isAvailable()).resolves.toBe(true)
    await expect(gcpMetadata.project('project-id')).resolves.toBe('test-project')
    await expect(
      gcpMetadata.instance({
        property: 'service-accounts/default/token',
        params: {
          scopes: 'https://www.googleapis.com/auth/cloud-platform'
        }
      })
    ).resolves.toEqual({
      expires_in: expect.any(Number),
      access_token: expect.any(String),
      token_type: 'Bearer'
    })
  })

  it('should get a token from the metadata server', async () => {
    const client = await google.auth.getClient()
    await expect(client.getAccessToken()).resolves.toMatchObject({})
  })
})
