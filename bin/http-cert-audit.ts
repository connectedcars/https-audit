#!/usr/bin/env node
/* eslint-disable no-console */

import { getTlsCertificateInfo } from '../src/https-cert-audit'

async function main(argv: string[]) {
  const domains = argv.slice(2)
  for (const domain of domains) {
    try {
      const certificate = await getTlsCertificateInfo(domain)
      const commonName = certificate.certificate.subject.CN
      const altNames = certificate.certificate.subjectaltname?.split(/,\s*/).map(a => a.replace(/^DNS:/, '')) ?? []
      const subjects = [...new Set([commonName, ...altNames])]
      const validFrom = new Date(certificate.certificate.valid_from)
      const validTo = new Date(certificate.certificate.valid_to)
      const now = new Date()
      const daysLeft = Math.round((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      console.log(
        `${domain}(${subjects.join(', ')}) ${
          certificate.authorized
        } ${validFrom.toISOString()} ${validTo.toISOString()} (${daysLeft} days left)`
      )
    } catch (e) {
      console.log(`${domain}: failed with error: ${e.message}`)
    }
  }
}

main(process.argv).catch(e => {
  console.error(e)
  process.exit(255)
})
