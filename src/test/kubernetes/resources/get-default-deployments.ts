export const getDefaultDeploymentsJson = {
  kind: 'DeploymentList',
  apiVersion: 'apps/v1',
  metadata: {
    selfLink: '/apis/apps/v1/namespaces/default/deployments',
    resourceVersion: '109954846'
  },
  items: [
    {
      metadata: {
        name: 'website',
        namespace: 'default',
        selfLink: '/apis/apps/v1/namespaces/default/deployments/website',
        uid: 'c10da8bd-9c6a-11e7-9175-42010af0029d',
        resourceVersion: '97310428',
        generation: 6,
        creationTimestamp: '2017-09-18T12:13:17Z',
        labels: {
          app: 'website'
        },
        annotations: {
          'deployment.kubernetes.io/revision': '6'
        }
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: 'website'
          }
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'website'
            }
          },
          spec: {
            volumes: [
              {
                name: 'website-deploykey',
                secret: {
                  secretName: 'website-deploykey',
                  defaultMode: 420
                }
              },
              {
                name: 'website-data',
                emptyDir: {}
              }
            ],
            containers: [
              {
                name: 'nginx',
                image: 'gcr.io/connectedcars-staging/nginxstatic:52ea07567630d43700385f313b0977f929932b9c',
                ports: [
                  {
                    name: 'listen-port',
                    containerPort: 80,
                    protocol: 'TCP'
                  }
                ],
                resources: {
                  requests: {
                    cpu: '50m',
                    memory: '200M'
                  }
                },
                volumeMounts: [
                  {
                    name: 'website-data',
                    mountPath: '/usr/share/nginx/html'
                  }
                ],
                livenessProbe: {
                  httpGet: {
                    path: '/index.html',
                    port: 'listen-port',
                    scheme: 'HTTP'
                  },
                  initialDelaySeconds: 60,
                  timeoutSeconds: 1,
                  periodSeconds: 5,
                  successThreshold: 1,
                  failureThreshold: 3
                },
                readinessProbe: {
                  httpGet: {
                    path: '/index.html',
                    port: 'listen-port',
                    scheme: 'HTTP'
                  },
                  initialDelaySeconds: 60,
                  timeoutSeconds: 1,
                  periodSeconds: 5,
                  successThreshold: 1,
                  failureThreshold: 3
                },
                lifecycle: {
                  preStop: {
                    exec: {
                      command: ['nginx', '-s', 'quit']
                    }
                  }
                },
                terminationMessagePath: '/dev/termination-log',
                terminationMessagePolicy: 'File',
                imagePullPolicy: 'IfNotPresent'
              }
            ],
            restartPolicy: 'Always',
            terminationGracePeriodSeconds: 30,
            dnsPolicy: 'ClusterFirst',
            securityContext: {},
            schedulerName: 'default-scheduler'
          }
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: 0,
            maxSurge: 1
          }
        },
        revisionHistoryLimit: 2,
        progressDeadlineSeconds: 600
      },
      status: {
        observedGeneration: 6,
        replicas: 3,
        updatedReplicas: 3,
        readyReplicas: 3,
        availableReplicas: 3,
        conditions: [
          {
            type: 'Progressing',
            status: 'True',
            lastUpdateTime: '2018-05-22T10:22:54Z',
            lastTransitionTime: '2017-09-18T12:13:17Z',
            reason: 'NewReplicaSetAvailable',
            message: 'ReplicaSet "website-fcbdf6d75" has successfully progressed.'
          },
          {
            type: 'Available',
            status: 'True',
            lastUpdateTime: '2019-04-17T18:43:40Z',
            lastTransitionTime: '2019-04-17T18:43:40Z',
            reason: 'MinimumReplicasAvailable',
            message: 'Deployment has minimum availability.'
          }
        ]
      }
    }
  ]
}
