import { HTTPServer } from '@connectedcars/http-server'
import log from '@connectedcars/logutil'

import { checkDomain, DomainCheckCriticalError, DomainCheckWarningError } from './https-cert-audit'
import { GcpKubernetesClient } from './integration/gcp-kubernetes'

export type ServerOptions = HTTPServer.ServerOptions & {
  checkInterval?: number
  dnsNames: string[]
  minumumCertificateDaysLeftWarning?: number
  minumumCertificateDaysLeftCritical?: number
  kubernetesCheck?: {
    url: string
    ca: Buffer
  }
}

export class Server extends HTTPServer.Server {
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

    // Health checks
    this.get('/_status', async () => {
      return { statusCode: 200, result: 'OK' }
    })
    this.get('/readiness', async () => {
      return { statusCode: 200, result: 'OK' }
    })
    this.get('/liveness', async () => {
      return { statusCode: 200, result: 'OK' }
    })
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
    let ingressTlsNames: string[] = []
    if (this.kubernetesClient) {
      ingressTlsNames = await this.kubernetesClient.fetchAllIngressTlsNames()
    }

    const dnsNames = new Set(this.dnsNames)
    const ingressDomains = new Set(ingressTlsNames)
    const domains = Array.from(new Set([...dnsNames, ...ingressDomains]))

    for (const domain of domains) {
      // TODO: https-audit currently doesn't support if multiple IPs are associated with a DNS record
      // TODO: This means that it only works for domains registered on our Google Load Balancers.
      // TODO: Because of this, we can only enable same-IP validation for ingress domains.
      // TODO: Story on fixing it: https://app.shortcut.com/connectedcars/story/120650/https-audit-should-support-validating-records-where-the-ip-can-change
      const altNamesSameIp = ingressDomains.has(domain) ? true : false

      const response = await checkDomain(domain, {
        family: 4,
        altNamesSameIp,
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
