import axios from 'axios'
import fs from 'fs'

import { KubernetesTestServer } from './kubernetes-test-server'

const localhostCertificate = fs.readFileSync(`src/test/kubernetes/resources/localhost.crt`)
const localhostPrivateKey = fs.readFileSync(`src/test/kubernetes/resources/localhost.key`)

describe('KubernetesTestServer', () => {
  const kubernetesTestServer = new KubernetesTestServer({
    cert: localhostCertificate,
    key: localhostPrivateKey
  })

  beforeAll(async () => {
    await kubernetesTestServer.start()
  })

  afterAll(async () => {
    await kubernetesTestServer.stop()
  })

  it('should start and the listenUrl should not be empty', async () => {
    expect(kubernetesTestServer.listenUrl).not.toBe('')
  })

  it('should respond 401 on /', async () => {
    const res = await axios.get(kubernetesTestServer.listenUrl, {
      httpsAgent: kubernetesTestServer.getCaAgent(),
      validateStatus: () => true
    })
    expect(res.status).toBe(401)
  })

  it('should respond 200 on / when using token', async () => {
    const res = await axios.get(kubernetesTestServer.listenUrl, {
      headers: { Authorization: 'Bearer ya29.Gl0' },
      httpsAgent: kubernetesTestServer.getCaAgent()
    })
    expect(res.status).toBe(200)
  })

  it('should respond 404 on /notfound when using token', async () => {
    const res = await axios.get(`${kubernetesTestServer.listenUrl}/notfound`, {
      headers: { Authorization: 'Bearer ya29.Gl0' },
      httpsAgent: kubernetesTestServer.getCaAgent(),
      validateStatus: () => true
    })
    expect(res.status).toBe(404)
    expect(res.data).toMatchObject({
      paths: expect.any(Array)
    })
  })

  it('should respond 200 on /apis/apps/v1/namespaces/default/deployments when using token', async () => {
    const res = await axios.get(`${kubernetesTestServer.listenUrl}/apis/apps/v1/namespaces/default/deployments`, {
      headers: {
        Authorization: 'Bearer ya29.Gl0'
      },
      httpsAgent: kubernetesTestServer.getCaAgent()
    })
    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({
      kind: 'DeploymentList',
      apiVersion: 'apps/v1',
      metadata: {},
      items: [
        {
          metadata: {
            name: 'website'
          }
        }
      ]
    })
  })
})
