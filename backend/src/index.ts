import http from 'node:http'
import * as Sentry from '@sentry/node'
import { createApp } from './app.js'
import { env, isFreeTier } from './config/env.js'
import { initSockets } from './sockets/io.js'
import { startJobs } from './jobs/index.js'
import { logger } from './lib/logger.js'
import { seedIfEmpty } from './services/seedCatalog.js'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

const app = createApp()
const server = http.createServer(app)
initSockets(server)
startJobs()

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV, freeTier: isFreeTier }, 'ClinicEase API listening')
  if (isFreeTier) {
    void seedIfEmpty()
      .then((r) => logger.info(r, 'seedIfEmpty'))
      .catch((err) => logger.error({ err }, 'seedIfEmpty failed'))
  }
})

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'unhandledRejection')
  Sentry.captureException(err)
})
