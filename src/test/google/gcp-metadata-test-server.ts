import { HttpIncomingMessage, HttpServer, HttpsServerOptions } from '@connectedcars/test'
import http from 'http'

// tslint:disable-next-line:no-empty-interface
export type GcpMetaDataTestServerOptions = HttpsServerOptions

export class GcpMetaDataTestServer extends HttpServer {
  public constructor(
    options: GcpMetaDataTestServerOptions,
    requestListener?: (req: HttpIncomingMessage, res: http.ServerResponse) => unknown | void
  ) {
    super(options, async (req, res) => {
      res.setHeader('Metadata-Flavor', 'Google')

      // Try to see if the request was handled by the requestListener
      if (requestListener && requestListener(req, res) !== undefined) {
        return
      }

      const parsedUrl = new URL(req.url, 'http://localhost')
      switch (parsedUrl.pathname) {
        case '/computeMetadata/v1/project/project-id': {
          return res.end('test-project')
        }
        case '/computeMetadata/v1/instance/attributes/cluster-name': {
          return res.end('kubernetes')
        }
        case '/computeMetadata/v1/universe/universe-domain': {
          return res.end('googleapis.com')
        }
        case '/computeMetadata/v1/instance/service-accounts/default/token': {
          return res.end(
            JSON.stringify({
              expires_in: 3600,
              access_token: 'ya29.Gl0',
              token_type: 'Bearer'
            })
          )
        }
        default: {
          res.statusCode = 404
          return res.end('Not Found')
        }
      }
    })
  }
}
