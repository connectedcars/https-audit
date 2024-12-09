export const getAllIngressJson = {
  apiVersion: 'v1',
  items: [
    {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        annotations: {
          'kubernetes.io/ingress.class': 'nginx'
        },
        creationTimestamp: '2024-05-08T09:23:36Z',
        generation: 1,
        name: 'api',
        namespace: 'default',
        resourceVersion: '1041785798',
        uid: '5db41c60-6aae-4a1e-8222-1092570bded9'
      },
      spec: {
        ingressClassName: 'nginx',
        rules: [
          {
            host: 'api.connectedcars.io',
            http: {
              paths: [
                {
                  backend: {
                    service: {
                      name: 'api',
                      port: {
                        name: 'http'
                      }
                    }
                  },
                  path: '/',
                  pathType: 'ImplementationSpecific'
                }
              ]
            }
          }
        ],
        tls: [
          {
            hosts: ['api.connectedcars.io']
          }
        ]
      },
      status: {
        loadBalancer: {
          ingress: [
            {
              ip: '10.0.0.1'
            }
          ]
        }
      }
    }
  ],
  kind: 'List',
  metadata: {
    resourceVersion: ''
  }
}
