import dns from 'dns'
import https from 'https'
import { PeerCertificate, TLSSocket } from 'tls'

export interface TlsCertificateInfo {
  authorizationError: Error
  authorized: boolean
  certificate: PeerCertificate
  address: string
  addressFamily: 4 | 6
}

export interface GetTlsCertificateInfoOptions {
  family: 4 | 6 | undefined
}

export async function getTlsCertificateInfo(
  domain: string,
  options?: GetTlsCertificateInfoOptions
): Promise<TlsCertificateInfo> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: domain,
        port: 443,
        agent: false,
        rejectUnauthorized: false,
        ciphers: 'ALL',
        family: options?.family
      },
      res => {
        const socket = res.socket as TLSSocket
        const certificate = socket.getPeerCertificate()
        if (certificate == null) {
          return reject(new Error('The website did not provide a certificate'))
        } else {
          resolve({
            authorized: socket.authorized,
            authorizationError: socket.authorizationError,
            certificate,
            address: socket.remoteAddress ?? '',
            addressFamily: socket.remoteFamily === 'IPv6' ? 6 : 4
          })
        }
      }
    )
    req.on('error', e => {
      reject(e)
    })
  })
}

export interface DnsName {
  name: string
  ip: string
  error?: Error
}

export interface LookupDnsNameOptions extends dns.LookupOneOptions {}

export function lookupDnsName(dnsName: string, options: LookupDnsNameOptions = {}): Promise<DnsName> {
  return new Promise<DnsName>(resolve => {
    dns.lookup(dnsName, options, (err, address) => {
      resolve({ name: dnsName, ip: address, error: err ?? undefined })
    })
  })
}

export interface DomainCheck {
  domain: string
  subjectNames: string[]
  certificateDaysLeft: number
  errors: Error[]
}

export interface CheckDomainOptions {
  altNamesSameIp?: boolean
  family: 4 | 6
}

export async function checkDomain(domain: string, options?: CheckDomainOptions): Promise<DomainCheck> {
  try {
    const certificate = await getTlsCertificateInfo(domain, { family: options?.family })
    const errors: Error[] = []

    // The certificate failed to validate with the CA certificate we have installed
    if (!certificate.authorized) {
      errors.push(
        new CertificateFailedValidation('Certificate failed validation', { cause: certificate.authorizationError })
      )
    }

    const commonName = certificate.certificate.subject.CN
    const altNames = certificate.certificate.subjectaltname?.split(/,\s*/).map(a => a.replace(/^DNS:/, '')) ?? []
    const subjects = [...new Set([commonName, ...altNames])]

    // Check all subjects have a valid DNS names
    for (const subject of subjects) {
      if (!subject.startsWith('*')) {
        const dnsName = await lookupDnsName(subject, { family: options?.family })
        if (dnsName.error) {
          if ('code' in dnsName.error && dnsName.error.code === 'ENOTFOUND') {
            errors.push(new DomainCheckError(`Alt name ${subject} does not resolve`))
          }
        } else if (dnsName.ip !== certificate.address) {
          errors.push(
            new DomainCheckError(
              `Alt name ${subject}(${dnsName.ip}) does not resolve to the same IP address as ${domain}(${certificate.address})`
            )
          )
        }
      }
    }

    const validTo = new Date(certificate.certificate.valid_to)
    const now = new Date()
    const daysLeft = Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      domain,
      subjectNames: subjects,
      certificateDaysLeft: daysLeft,
      errors
    }
  } catch (e) {
    return {
      domain,
      subjectNames: [],
      certificateDaysLeft: -1,
      errors: [e]
    }
  }
}

export class DomainCheckError extends Error {
  public constructor(message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = this.constructor.name
  }
}

export class CertificateFailedValidation extends DomainCheckError {}
