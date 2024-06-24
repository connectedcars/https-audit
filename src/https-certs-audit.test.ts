import { checkDomain, lookupDnsName } from './https-cert-audit'

describe('https-certs-audit', () => {
  it('lookupDnsName', async () => {
    const response = await lookupDnsName('google.com')
    expect(response).toEqual({ error: undefined, ip: expect.any(String), name: 'google.com' })
  })

  it('lookupDnsName unknown domain', async () => {
    const response = await lookupDnsName('does-not-exits.google.com')
    expect(response).toEqual({
      ip: undefined,
      name: 'does-not-exits.google.com',
      error: expect.objectContaining({ code: 'ENOTFOUND' })
    })
  }, 10000)

  it('checkDomain', async () => {
    const response = await checkDomain('google.com', { family: 4, altNamesSameIp: true })
    expect(response).toEqual({
      domain: 'google.com',
      subjectNames: expect.arrayContaining(['*.google.com', 'google.com']),
      certificateDaysLeft: expect.any(Number),
      errors: expect.arrayContaining([])
    })
  })
})
