import log from '@connectedcars/logutil'
import fs from 'fs'

import { Server } from './server'
import { GcpMetaDataTestServer } from './test/google/gcp-metadata-test-server'
import { KubernetesTestServer } from './test/kubernetes/kubernetes-test-server'

const localhostCertificate = fs.readFileSync(`src/test/kubernetes/resources/localhost.crt`)
const localhostPrivateKey = fs.readFileSync(`src/test/kubernetes/resources/localhost.key`)

describe('server', () => {
  const gcpMetaDataTestServer = new GcpMetaDataTestServer({
    cert: localhostCertificate,
    key: localhostPrivateKey
  })

  const kubernetesTestServer = new KubernetesTestServer({
    cert: localhostCertificate,
    key: localhostPrivateKey
  })

  beforeAll(async () => {
    // Set up the GCP Metadata Test Server and make sure it gets used by gcpAuthClient
    await gcpMetaDataTestServer.start()
    process.env.GCE_METADATA_HOST = gcpMetaDataTestServer.listenUrl
    process.env.METADATA_SERVER_DETECTION = 'assume-present'
    process.env.PATH = '' // Make sure the libs it can't call gcloud so

    await kubernetesTestServer.start()
  })

  afterAll(async () => {
    await gcpMetaDataTestServer.stop()
    await kubernetesTestServer.stop()
  })

  it('basic test', async () => {
    const logWarns: Array<{ message: string; context: object | null }> = []
    jest.spyOn(log, 'warn').mockImplementation((...args) => {
      if (args.length > 1 && typeof args[0] === 'string' && typeof args[1] === 'object') {
        logWarns.push({ message: args[0], context: args[1] })
      }
    })

    const server = new Server({ dnsNames: ['google.com'] })
    await server.start()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await server.stop()
    expect(logWarns).toEqual([
      { message: 'Check domain failed for google.com', context: { domain: 'google.com', errors: expect.any(Array) } }
    ])
  }, 10_000)

  it('kubernetes ingress check', async () => {
    const logWarns: Array<{ message: string; context: object | null }> = []
    jest.spyOn(log, 'warn').mockImplementation((...args) => {
      if (args.length > 1 && typeof args[0] === 'string' && typeof args[1] === 'object') {
        logWarns.push({ message: args[0], context: args[1] })
      }
    })

    const logInfo: Array<{ message: string; context: object | null }> = []
    jest.spyOn(log, 'info').mockImplementation((...args) => {
      if (args.length > 1 && typeof args[0] === 'string' && typeof args[1] === 'object') {
        logInfo.push({ message: args[0], context: args[1] })
      }
    })

    const server = new Server({
      dnsNames: ['google.com'],
      kubernetesCheck: {
        url: kubernetesTestServer.listenUrl,
        ca: localhostCertificate
      }
    })
    await server.start()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await server.stop()
    expect(logWarns).toEqual([
      { message: 'Check domain failed for google.com', context: { domain: 'google.com', errors: expect.any(Array) } }
    ])
    expect(logInfo).toEqual([
      {
        context: {
          altNamesCount: expect.any(Number),
          certificateDaysLeft: expect.any(Number),
          domain: 'connectedcars.io'
        },
        message: 'Check domain connectedcars.io'
      },
      {
        context: {
          altNamesCount: expect.any(Number),
          certificateDaysLeft: expect.any(Number),
          domain: 'www.connectedcars.io'
        },
        message: 'Check domain www.connectedcars.io'
      }
    ])
  }, 10_000)
})
