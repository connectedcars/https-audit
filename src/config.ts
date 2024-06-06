export function getListenPort(): number {
  return process.env.HTTP_LISTEN_PORT ? parseInt(process.env.HTTP_LISTEN_PORT) : 4000
}

export function getDnsNames(): string[] {
  if (process.env.DNS_NAMES) {
    return process.env.DNS_NAMES.split(',')
  }
  throw new Error('DNS_NAMES is not set')
}

export function getCheckInterval(): number {
  return process.env.CHECK_INTERVAL ? parseInt(process.env.CHECK_INTERVAL) * 1000 : 600_000
}
