import * as k8s from '@kubernetes/client-node'
import fs from 'fs'
import { google } from 'googleapis'

import { GcpMetaDataTestServer } from '../test/google/gcp-metadata-test-server'
import { KubernetesTestServer } from '../test/kubernetes/kubernetes-test-server'
import { GcpKubernetesClient, getGcpKubernetesClient, GoogleAuthClient } from './gcp-kubernetes'

const localhostCertificate = fs.readFileSync(`src/test/kubernetes/resources/localhost.crt`)
const localhostPrivateKey = fs.readFileSync(`src/test/kubernetes/resources/localhost.key`)

describe('getGcpKubernetesClient', () => {
  let gcpAuthClient: GoogleAuthClient

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

    gcpAuthClient = await google.auth.getClient()

    await kubernetesTestServer.start()
  })

  afterAll(async () => {
    await gcpMetaDataTestServer.stop()
    await kubernetesTestServer.stop()
  })

  it('should create a kubernetes core client and return a list of namespaces', async () => {
    const k8sCoreClient = getGcpKubernetesClient(
      gcpAuthClient,
      k8s.CoreV1Api,
      kubernetesTestServer.listenUrl,
      localhostCertificate
    )
    await expect(k8sCoreClient.listNamespace()).resolves.toMatchObject({})
  })

  it('should create a kubernetes networking client and return a list of ingresses', async () => {
    const k8sNetworkingClient = getGcpKubernetesClient(
      gcpAuthClient,
      k8s.NetworkingV1Api,
      kubernetesTestServer.listenUrl,
      localhostCertificate
    )
    await expect(k8sNetworkingClient.listIngressForAllNamespaces()).resolves.toMatchObject({
      body: {
        items: expect.any(Array)
      }
    })
  })

  it('should create a gcp kubernetes client and return a list of tls names', async () => {
    const gcpKubernetesClient = new GcpKubernetesClient({
      url: kubernetesTestServer.listenUrl,
      ca: localhostCertificate
    })
    await expect(gcpKubernetesClient.fetchAllIngressTlsNames()).resolves.toEqual(['api.connectedcars.io'])
  })
})
