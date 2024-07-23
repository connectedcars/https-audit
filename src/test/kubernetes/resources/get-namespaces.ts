export const getNamespacesJson = [
  {
    metadata: {
      name: 'default',
      selfLink: '/api/v1/namespaces/default',
      uid: '2f4f7617-890e-11e7-a708-42010a8401e3',
      resourceVersion: '4',
      creationTimestamp: '2017-08-24T20:52:47Z'
    },
    spec: { finalizers: ['kubernetes'] },
    status: { phase: 'Active' }
  },
  {
    metadata: {
      name: 'ingress-nginx',
      selfLink: '/api/v1/namespaces/ingress-nginx',
      uid: 'd4709e77-d9f5-11e7-94b2-42010a8400d8',
      resourceVersion: '13192552',
      creationTimestamp: '2017-12-05T19:52:31Z',
      annotations: {
        'kubectl.kubernetes.io/last-applied-configuration':
          '{"apiVersion":"v1","kind":"Namespace","metadata":{"annotations":{},"name":"ingress-nginx","namespace":""}}\n'
      }
    },
    spec: { finalizers: ['kubernetes'] },
    status: { phase: 'Active' }
  },
  {
    metadata: {
      name: 'kube-public',
      selfLink: '/api/v1/namespaces/kube-public',
      uid: '326e195a-890e-11e7-a708-42010a8401e3',
      resourceVersion: '56',
      creationTimestamp: '2017-08-24T20:52:52Z'
    },
    spec: { finalizers: ['kubernetes'] },
    status: { phase: 'Active' }
  },
  {
    metadata: {
      name: 'kube-system',
      selfLink: '/api/v1/namespaces/kube-system',
      uid: '2f87963c-890e-11e7-a708-42010a8401e3',
      resourceVersion: '13189348',
      creationTimestamp: '2017-08-24T20:52:47Z',
      annotations: {
        'kubectl.kubernetes.io/last-applied-configuration':
          '{"apiVersion":"v1","kind":"Namespace","metadata":{"annotations":{},"name":"kube-system","namespace":""}}\n'
      }
    },
    spec: { finalizers: ['kubernetes'] },
    status: { phase: 'Active' }
  }
]
