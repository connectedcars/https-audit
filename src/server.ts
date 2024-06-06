import log from '@connectedcars/logutil'
import http from 'http'

import { HttpIncomingMessage, HttpServer, HttpServerOptions } from './http/http-server'
import { checkDomain } from './https-cert-audit'

export type ServerOptions = HttpServerOptions & {
  checkInterval?: number
  dnsNames: string[]
}

export class Server extends HttpServer {
  private checkIntervalHandle: NodeJS.Timeout | undefined
  private checkInterval: number
  private dnsNames: string[]
  private running: boolean = false

  public constructor(options: ServerOptions) {
    super(options)
    this.checkInterval = options.checkInterval || 600_000
    this.dnsNames = options.dnsNames
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
      case '/_status': {
        return res.end()
      }
      default: {
        res.statusCode = 404
        return res.end('Not found')
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
    for (const domain of this.dnsNames) {
      const response = await checkDomain(domain, { family: 4, altNamesSameIp: true })
      if (response.errors.length > 0) {
        log.error(`Check domain failed for ${domain}`, { domain, errors: response.errors.map(e => e.message) })
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
