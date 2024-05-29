import https from 'https'
import { PeerCertificate, TLSSocket } from 'tls'

export async function getTlsCertificate(
  domain: string
): Promise<{ authorizationError: Error; authorized: boolean; certificate: PeerCertificate }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: domain,
        port: 443,
        agent: false,
        rejectUnauthorized: false,
        ciphers: 'ALL'
      },
      res => {
        const socket = res.socket as TLSSocket
        const certificate = socket.getPeerCertificate()
        if (certificate == null) {
          reject(new Error('The website did not provide a certificate'))
        } else {
          resolve({ authorized: socket.authorized, authorizationError: socket.authorizationError, certificate })
        }
      }
    )
    req.on('error', e => {
      reject(e)
    })
  })
}
