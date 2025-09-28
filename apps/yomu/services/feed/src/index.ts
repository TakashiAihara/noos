import * as grpc from '@grpc/grpc-js'
import { env } from './env'

const server = new grpc.Server()

server.bindAsync(`0.0.0.0:${env.PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Failed to bind server:', error)
    return
  }
  console.log(`Feed Service gRPC server running on port ${port} (${env.NODE_ENV})`)
})

process.on('SIGTERM', () => {
  server.tryShutdown(() => {
    console.log('Feed Service shut down gracefully')
  })
})
