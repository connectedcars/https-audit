import log from '@connectedcars/logutil'

import { getListenPort } from './config'
import { Server } from './server'

async function main(): Promise<void> {
  const listenPort = getListenPort()
  const server = new Server({
    listenPort
  })
  await server.start()
  log.info(`HTTP server running at 0.0.0.0:${listenPort}`)

  // eslint-disable-next-line func-style
  const shutdown: () => Promise<void> = async () => {
    await server.stop()
  }

  process.on('SIGINT', () => {
    log.warn('Got SIGINT')
    shutdown().catch(e => {
      log.warn(e, { trigger: 'shutdown failed on sigint' })
      process.exit(1)
    })
  })
  process.on('SIGTERM', () => {
    log.warn('Got SIGTERM')
    shutdown().catch(e => {
      log.warn(e, { trigger: 'shutdown failed on sigterm' })
      process.exit(1)
    })
  })
  process.on('uncaughtException', err => {
    log.warn(err, { trigger: 'uncaughtException' })
    process.exit(1)
  })
  process.on('unhandledRejection', reason => {
    log.warn(reason, { trigger: 'unhandledRejection' })
    process.exit(1)
  })
}

main().catch(e => {
  log.error(e)
})
