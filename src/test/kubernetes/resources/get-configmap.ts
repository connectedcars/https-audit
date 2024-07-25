export const getConfigMapJson = {
  kind: 'ConfigMap',
  apiVersion: 'v1',
  metadata: {
    name: 'common',
    namespace: 'default',
    selfLink: '/api/v1/namespaces/default/configmaps/common',
    uid: '3d134a3b-a8fb-11e7-aefa-42010a8400d8',
    resourceVersion: '161292117',
    creationTimestamp: '2017-10-04T11:57:47Z',
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"v1","data":{"ENVIRONMENT":"production","NODE_ENV":"production"},"kind":"ConfigMap","metadata":{"annotations":{},"name":"common","namespace":"default"}}\n'
    }
  },
  data: { ENVIRONMENT: 'production', NODE_ENV: 'production' }
}
