export const getSecretJson = {
  apiVersion: 'v1',
  data: {
    CORE_DB: 'test'
  },
  kind: 'Secret',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"v1","data":{"CORE_DB": "test"},"kind":"Secret","metadata":{"annotations":{},"name":"common","namespace":"default"},"type":"Opaque"}\n'
    },
    creationTimestamp: '2017-10-03T10:59:38Z',
    name: 'common',
    namespace: 'default',
    resourceVersion: '5070408',
    selfLink: '/api/v1/namespaces/default/secrets/common',
    uid: 'f369846d-a829-11e7-aefa-42010a8400d8'
  },
  type: 'Opaque'
}
