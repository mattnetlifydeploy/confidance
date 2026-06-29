import crypto from 'crypto'

export type WaitlistRow = {
  id: string
  position: number
  notified_at: string | null
  expires_at: string | null
}

export function nextPosition(existingRows: WaitlistRow[]): number {
  if (existingRows.length === 0) return 1
  return Math.max(...existingRows.map(r => r.position)) + 1
}

export function selectNextToPromote(rows: WaitlistRow[]): WaitlistRow | null {
  const candidates = rows.filter(r => r.notified_at === null)
  if (candidates.length === 0) return null
  return candidates.reduce((lowest, current) =>
    current.position < lowest.position ? current : lowest
  )
}

export function signWaitlistToken(id: string, expiresAtIso: string, secret: string): string {
  const payload = `${id}|${expiresAtIso}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return `${payload}.${signature}`
}

export function verifyWaitlistToken(token: string, secret: string): { valid: true; id: string; expiresAtIso: string } | { valid: false } {
  const lastDotIndex = token.lastIndexOf('.')
  if (lastDotIndex === -1) return { valid: false }

  const payload = token.substring(0, lastDotIndex)
  const signature = token.substring(lastDotIndex + 1)

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  if (signature.length !== expectedSignature.length) {
    return { valid: false }
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false }
  }

  const pipeIndex = payload.indexOf('|')
  if (pipeIndex === -1) return { valid: false }

  const id = payload.substring(0, pipeIndex)
  const expiresAtIso = payload.substring(pipeIndex + 1)

  if (!id || !expiresAtIso) return { valid: false }

  return { valid: true, id, expiresAtIso }
}
