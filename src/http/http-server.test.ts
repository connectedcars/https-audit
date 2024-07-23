import axios from 'axios'

import { HttpServer, HttpServerOptions, readHttpJson, writeHttpJson } from './http-server'

type TestHttpServerOptions = HttpServerOptions

class TestHttpServer extends HttpServer {
  public constructor(options: TestHttpServerOptions = {}) {
    super(options, async (req, res) => {
      // Map the responses
      switch (req.url) {
        case '/': {
          return res.end('Hello world')
        }
        case '/json': {
          const json = await readHttpJson(req)
          return writeHttpJson(res, json)
        }
        default: {
          res.statusCode = 404
          return res.end('Not found')
        }
      }
    })
  }
}

describe('HttpServer', () => {
  const httpServer = new TestHttpServer()

  beforeAll(async () => {
    await httpServer.start()
  })

  afterAll(async () => {
    await httpServer.stop()
  })

  it('Simple GET /', async () => {
    const response = await axios.get<string>(`${httpServer.listenUrl}`)
    expect(response.data).toEqual('Hello world')
  })

  it('should GET /json and return json requests', async () => {
    const response = await axios.post<string>(`${httpServer.listenUrl}/json`, { test: 'data' })
    expect(response.data).toMatchObject({ test: 'data' })
  })
})
