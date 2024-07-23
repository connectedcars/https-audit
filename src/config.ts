import fs from 'fs'

export function getCheckKubernetesIngress(): boolean {
  if (process.env.CHECK_KUBERNETES_INGRESS) {
    return process.env.CHECK_KUBERNETES_INGRESS === 'true' || process.env.CHECK_KUBERNETES_INGRESS === '1'
  }
  return false
}

export function getKubernetesServiceHost(): string {
  if (process.env.KUBERNETES_SERVICE_HOST) {
    return process.env.KUBERNETES_SERVICE_HOST
  }
  throw new Error('KUBERNETES_SERVICE_HOST is not set')
}

export function getKubernetesServicePortHttps(): number {
  if (process.env.KUBERNETES_SERVICE_PORT_HTTPS) {
    const port = parseInt(process.env.KUBERNETES_SERVICE_PORT_HTTPS)
    if (!isNaN(port)) {
      return parseInt(process.env.KUBERNETES_SERVICE_PORT_HTTPS)
    }
  }
  throw new Error('KUBERNETES_SERVICE_PORT_HTTPS is not set or not a number')
}

export function getKubernetesServiceCa(): Buffer {
  if (process.env.KUBERNETES_SERVICE_CA_PATH) {
    try {
      const caData = fs.readFileSync(process.env.KUBERNETES_SERVICE_CA_PATH)
      return caData
    } catch (e) {
      throw new Error('KUBERNETES_SERVICE_CA_PATH is not a valid path or problem reading the file', { cause: e })
    }
  }
  try {
    // Try to read the ca from the default path
    const caData = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt')
    return caData
  } catch (e) {
    throw new Error('Problems reading /var/run/secrets/kubernetes.io/serviceaccount/ca.crt', { cause: e })
  }
}

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
