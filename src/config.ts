export function getListenPort(): number {
  return process.env.HTTP_LISTEN_PORT ? parseInt(process.env.HTTP_LISTEN_PORT) : 4000
}
