import * as k8s from '@kubernetes/client-node'
import { google } from 'googleapis'

export interface GcpKubernetesClientOptions {
  url: string
  ca: Buffer
}

export class GcpKubernetesClient {
  private url: string
  private ca: Buffer
  private gcpAuthClient!: GoogleAuthClient
  private initPromise?: Promise<void>
  private networkingClient?: k8s.NetworkingV1Api

  public constructor(options: GcpKubernetesClientOptions) {
    this.url = options.url
    this.ca = options.ca
    this.init().catch(() => {
      // Do nothing
    })
  }

  public async fetchAllIngressTlsNames(): Promise<string[]> {
    await this.init()
    const k8sNetworkingClient = this.getNetworkingClient()
    const result: Set<string> = new Set()

    const ingressResponse = await k8sNetworkingClient.listIngressForAllNamespaces()
    for (const ingress of ingressResponse.body.items) {
      if (ingress.spec?.tls) {
        const names = ingress.spec.tls.map(t => t.hosts || []).flat()
        for (const name of names) {
          result.add(name)
        }
      }
    }
    return Array.from(result)
  }

  private async init(): Promise<void> {
    if (this.gcpAuthClient) {
      return
    }
    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.gcpAuthClient = await google.auth.getClient({
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        })
      })()
    }
    return this.initPromise
  }

  private getNetworkingClient(): k8s.NetworkingV1Api {
    if (!this.networkingClient) {
      this.networkingClient = getGcpKubernetesClient(this.gcpAuthClient, k8s.NetworkingV1Api, this.url, this.ca)
    }
    return this.networkingClient
  }
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T
export type GoogleAuthClient = UnPromisify<ReturnType<typeof google.auth.getClient>>

export function getGcpKubernetesClient<T extends k8s.ApiType>(
  gcpAuthClient: GoogleAuthClient,
  clientType: new (server: string) => T,
  url: string,
  certificateAuthority: Buffer
): T {
  const client = new clientType(url)
  client.setDefaultAuthentication({
    applyToRequest: async opts => {
      opts.ca = certificateAuthority
      const accessToken = await gcpAuthClient.getAccessToken()
      if (accessToken.token) {
        if (opts.headers !== undefined) {
          opts.headers.Authorization = 'Bearer ' + accessToken.token
        } else {
          opts.headers = {
            Authorization: 'Bearer ' + accessToken.token
          }
        }
      }
    }
  })
  return client
}
