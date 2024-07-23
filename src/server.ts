import log from '@connectedcars/logutil'
import http from 'http'

import { HttpIncomingMessage, HttpServer, HttpServerOptions } from './http/http-server'
import { checkDomain, DomainCheckCriticalError, DomainCheckWarningError } from './https-cert-audit'
import { GcpKubernetesClient } from './integration/gcp-kubernetes'

export type ServerOptions = HttpServerOptions & {
  checkInterval?: number
  dnsNames: string[]
  minumumCertificateDaysLeftWarning?: number
  minumumCertificateDaysLeftCritical?: number
  kubernetesCheck?: {
    url: string
    ca: Buffer
  }
}

export class Server extends HttpServer {
  private checkIntervalHandle: NodeJS.Timeout | undefined
  private checkInterval: number
  private dnsNames: string[]
  private running: boolean = false
  private minumumCertificateDaysLeftWarning: number
  private minumumCertificateDaysLeftCritical: number
  private kubernetesClient?: GcpKubernetesClient

  public constructor(options: ServerOptions) {
    super(options)
    this.checkInterval = options.checkInterval || 600_000
    this.dnsNames = options.dnsNames
    this.minumumCertificateDaysLeftWarning = options.minumumCertificateDaysLeftWarning || 14
    this.minumumCertificateDaysLeftCritical = options.minumumCertificateDaysLeftCritical || 14
    if (options.kubernetesCheck) {
      this.kubernetesClient = new GcpKubernetesClient({
        url: options.kubernetesCheck.url,
        ca: options.kubernetesCheck.ca
      })
    }
  }

  public async start(): Promise<void> {
    this.checkDomainSync()
    this.checkIntervalHandle = setInterval(() => {
      this.checkDomainSync()
    }, this.checkInterval)
    await super.start()
  }

  public async stop(): Promise<void> {
    if (this.checkIntervalHandle) {
      clearInterval(this.checkIntervalHandle)
    }
    while (this.running) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return super.stop()
  }

  protected async requestListener(req: HttpIncomingMessage, res: http.ServerResponse): Promise<void | unknown> {
    switch (req.url) {
      case '/_status':
      case '/liveness':
      case '/readiness': {
        res.end()
        return
      }

      default: {
        res.statusCode = 404
        res.end('Not found')
        return
      }
    }
  }

  private checkDomainSync(): void {
    if (!this.running) {
      this.running = true
      this.checkDomains()
        .catch(e => {
          log.error('Check domains failed', { error: e })
        })
        .finally(() => {
          this.running = false
        })
    }
  }

  private async checkDomains(): Promise<void> {
    const ingressTlsNames: string[] = []
    if (this.kubernetesClient) {
      const tlsNames = await this.kubernetesClient.fetchAllIngressTlsNames()
      for (const tlsName of tlsNames) {
        ingressTlsNames.push(tlsName)
      }
    }

    const domains = [...new Set([...this.dnsNames, ...ingressTlsNames])]
    for (const domain of domains) {
      const response = await checkDomain(domain, {
        family: 4,
        altNamesSameIp: true,
        minumumCertificateDaysLeftWarning: this.minumumCertificateDaysLeftWarning,
        minumumCertificateDaysLeftCritical: this.minumumCertificateDaysLeftCritical
      })
      if (response.errors.length > 0) {
        if (response.errors.some(e => e instanceof DomainCheckCriticalError)) {
          log.critical(`Check domain failed for ${domain}`, { domain, errors: response.errors.map(e => e.message) })
        } else if (response.errors.some(e => e instanceof DomainCheckWarningError)) {
          log.warn(`Check domain failed for ${domain}`, { domain, errors: response.errors.map(e => e.message) })
        } else {
          log.warn(`Check domain failed for ${domain}`, { domain, errors: response.errors.map(e => e.message) })
        }
      } else {
        log.info(`Check domain ${domain}`, {
          domain,
          certificateDaysLeft: response.certificateDaysLeft,
          altNamesCount: response.subjectNames.length
        })
      }
    }
  }
}
