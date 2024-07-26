import { HttpIncomingMessage, HttpsServer, HttpsServerOptions } from '@connectedcars/test'
import http from 'http'

import { get404Json } from './resources/get-404'
import { getAllIngressJson } from './resources/get-all-ingress'
import { getConfigMapJson } from './resources/get-configmap'
import { getDefaultDeploymentsJson } from './resources/get-default-deployments'
import { getIngressJson } from './resources/get-ingress'
import { getNamespacesJson } from './resources/get-namespaces'
import { getRootJson } from './resources/get-root'
import { getSecretJson } from './resources/get-secret'
import { getServiceJson } from './resources/get-service'

// How to get samples for the test server:
// kubectl get ingress -A -v 8 -o json|pbcopy

export type KubernetesTestServerOptions = HttpsServerOptions

export class KubernetesTestServer extends HttpsServer {
  public constructor(
    options: KubernetesTestServerOptions,
    requestListener?: (req: HttpIncomingMessage, res: http.ServerResponse) => unknown | void
  ) {
    super(options, async (req, res) => {
      res.setHeader('Content-Type', 'application/json')

      // Validate that we have an authorization token and that it looks valid
      if (!req.headers.authorization || !req.headers.authorization.match(/^Bearer [a-zA-Z0-9_-]+\./)) {
        res.statusCode = 401
        return res.end(
          JSON.stringify({
            kind: 'Status',
            apiVersion: 'v1',
            metadata: {},
            status: 'Failure',
            message: 'Unauthorized',
            reason: 'Unauthorized',
            code: 401
          })
        )
      }

      // Try to see if the request was handled by the requestListener
      if (requestListener && requestListener(req, res) !== undefined) {
        return
      }

      // Map the responses
      const parsedUrl = new URL(req.url, 'http://localhost')
      switch (parsedUrl.pathname) {
        case '/': {
          return res.end(JSON.stringify(getRootJson))
        }
        case '/apis/apps/v1/namespaces/default/deployments': {
          return res.end(JSON.stringify(getDefaultDeploymentsJson))
        }
        case '/apis/networking.k8s.io/v1/namespaces/default/ingresses/website': {
          return res.end(JSON.stringify(getIngressJson))
        }
        case '/apis/networking.k8s.io/v1/ingresses': {
          return res.end(JSON.stringify(getAllIngressJson))
        }
        case '/api/v1/namespaces/default/services/website': {
          return res.end(JSON.stringify(getServiceJson))
        }
        case '/api/v1/namespaces/default/configmaps/common': {
          return res.end(JSON.stringify(getConfigMapJson))
        }
        case '/api/v1/namespaces/default/secrets/common': {
          return res.end(JSON.stringify(getSecretJson))
        }
        case '/api/v1/namespaces': {
          return res.end(JSON.stringify(getNamespacesJson))
        }
        default: {
          res.statusCode = 404
          return res.end(JSON.stringify(get404Json))
        }
      }
    })
  }
}
