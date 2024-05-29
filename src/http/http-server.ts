import http from 'http'
import net from 'net'

export type HttpIncomingMessage = http.IncomingMessage & Required<Pick<http.IncomingMessage, 'method' | 'url'>>
export type HttpRequestListener = (
  req: HttpIncomingMessage,
  res: http.ServerResponse
) => void | unknown | Promise<void | unknown>

export class HttpServerError extends Error {
  public statusCode: number
  public response: string | Json
  public constructor(message: string | Json, statusCode = 500) {
    super(JSON.stringify(message))
    this.response = message
    this.statusCode = statusCode
  }
}

export type HttpServerOptions = http.ServerOptions & {
  listenPort?: number
}

export class HttpServer {
  public listenUrl = ''
  public listenPort: number
  private httpServer: http.Server

  public constructor(options: HttpServerOptions, requestListener?: HttpRequestListener) {
    this.requestListener = requestListener ? requestListener : this.requestListener
    this.httpServer = http.createServer(options, (req, res) => {
      this.handleRequest(req as HttpIncomingMessage, res)
    })
    this.listenPort = options.listenPort || 0
  }

  public async start(): Promise<void> {
    this.httpServer.on('listening', () => {
      const addressInfo = this.httpServer.address() as net.AddressInfo
      this.listenPort = addressInfo.port
      this.listenUrl = `http://127.0.0.1:${this.listenPort}`
    })
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.listenPort, () => {
        resolve()
      })
      this.httpServer.on('error', e => {
        reject(e)
      })
    })
  }

  public async stop(): Promise<void> {
    return new Promise(resolve => {
      // TODO: Error handling
      this.httpServer.close(() => {
        resolve()
      })
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, listener: (...args: any[]) => void): this {
    this.httpServer.on(event, listener)
    return this
  }

  protected requestListener(
    req: HttpIncomingMessage,
    res: http.ServerResponse
  ): void | unknown | Promise<void | unknown> {
    res.statusCode = 404
    return res.end('Not found')
  }

  protected handleRequest(req: HttpIncomingMessage, res: http.ServerResponse): void {
    try {
      Promise.resolve(this.requestListener(req, res)).catch(e => {
        this.handleError(req, res, e)
      })
    } catch (e) {
      this.handleError(req, res, e)
    }
  }

  protected handleError(req: HttpIncomingMessage, res: http.ServerResponse, e: Error): void {
    if (e instanceof HttpServerError) {
      res.statusCode = e.statusCode
      if (typeof e.response === 'string') {
        res.end(e.response)
      } else {
        res.end(JSON.stringify(e.response, null, 2))
      }
    } else {
      res.statusCode = 500
      res.end('Unknown error')
      this.httpServer.emit('error', e)
    }
  }
}

export async function readHttpMessageBody(req: HttpIncomingMessage, maxSize = 2_097_152): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > maxSize) {
        reject(new Error(`Response size over max size: ${size} > ${maxSize}`))
        return req.removeAllListeners()
      }
      body.push(chunk)
      return
    })
    req.on('end', () => {
      resolve(Buffer.concat(body))
    })
  })
}

// https://github.com/microsoft/TypeScript/issues/1897
export type Json = null | boolean | number | string | Json[] | { [prop: string]: Json }

export async function readHttpJson<T = Json>(req: HttpIncomingMessage, maxSize = 2_097_152): Promise<T> {
  const body = await readHttpMessageBody(req, maxSize)
  const json = JSON.parse(body.toString('utf8'))
  return json
}

export async function writeHttpJson(res: http.ServerResponse, response: Json): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response))
}
