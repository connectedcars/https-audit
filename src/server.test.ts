import log from '@connectedcars/logutil'

import { Server } from './server'

describe('server', () => {
  it('basic test', async () => {
    const logWarns: Array<{ message: string; context: object | null }> = []
    jest.spyOn(log, 'warn').mockImplementation((...args) => {
      if (args.length > 1 && typeof args[0] === 'string' && typeof args[1] === 'object') {
        logWarns.push({ message: args[0], context: args[1] })
      }
    })

    const server = new Server({ dnsNames: ['google.com'] })
    await server.start()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await server.stop()
    expect(logWarns).toEqual([
      { message: 'Check domain failed for google.com', context: { domain: 'google.com', errors: expect.any(Array) } }
    ])
  }, 10_000)
})
