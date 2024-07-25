export const getServiceJson = {
  kind: 'Service',
  apiVersion: 'v1',
  metadata: {
    name: 'website',
    namespace: 'default',
    selfLink: '/api/v1/namespaces/default/services/website',
    uid: 'd2d57ea7-2322-11ea-a4dc-42010a8402a8',
    resourceVersion: '160248981',
    creationTimestamp: '2019-12-20T12:18:26Z',
    labels: { app: 'website' },
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"app":"website"},"name":"website","namespace":"default"},"spec":{"ports":[{"name":"http","port":80,"protocol":"TCP","targetPort":"listen-port"}],"selector":{"app":"website"},"type":"ClusterIP"}}\n'
    }
  },
  spec: {
    ports: [{ name: 'http', protocol: 'TCP', port: 80, targetPort: 'listen-port' }],
    selector: { app: 'website' },
    clusterIP: '10.0.0.2',
    type: 'ClusterIP',
    sessionAffinity: 'None'
  },
  status: { loadBalancer: {} }
}
