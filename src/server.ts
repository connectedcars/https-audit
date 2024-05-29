import http from 'http'

import { HttpIncomingMessage, HttpServer, HttpServerOptions } from './http/http-server'

export type ServerOptions = HttpServerOptions

export class Server extends HttpServer {
  public constructor(options: ServerOptions) {
    super(options)
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
}
