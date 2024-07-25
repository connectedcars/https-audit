export const getIngressJson = {
  kind: 'Ingress',
  apiVersion: 'apps/v1',
  metadata: {
    name: 'website',
    namespace: 'default',
    selfLink: '/apis/apps/v1/namespaces/default/ingresses/website',
    uid: '3d8f3be9-2323-11ea-a4dc-42010a8402a8',
    resourceVersion: '160249840',
    generation: 1,
    creationTimestamp: '2019-12-20T12:21:25Z',
    annotations: {
      'ingress.kubernetes.io/proxy-body-size': '40m'
    }
  },
  spec: {
    tls: [
      {
        hosts: ['connectedcars.io', 'www.connectedcars.io']
      }
    ],
    rules: [
      {
        host: 'connectedcars.io',
        http: { paths: [{ path: '/', backend: { serviceName: 'website', servicePort: 80 } }] }
      },
      {
        host: 'www.connectedcars.io',
        http: { paths: [{ path: '/', backend: { serviceName: 'website', servicePort: 80 } }] }
      }
    ]
  },
  status: { loadBalancer: { ingress: [{ ip: '1.2.3.4' }] } }
}
