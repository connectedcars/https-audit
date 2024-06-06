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

export function getMinumumCertificateDaysLeftWarning(): number {
  return process.env.MINUMUM_CERTIFICATE_DAYS_LEFT_WARNING
    ? parseInt(process.env.MINUMUM_CERTIFICATE_DAYS_LEFT_WARNING)
    : 14
}

export function getMinumumCertificateDaysLeftCritical(): number {
  return process.env.MINUMUM_CERTIFICATE_DAYS_LEFT_CRITICAL
    ? parseInt(process.env.MINUMUM_CERTIFICATE_DAYS_LEFT_CRITICAL)
    : 7
}
