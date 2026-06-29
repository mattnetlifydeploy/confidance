// Shared enquiry email layer for the school + parent lead inboxes.
// Two messages per submission, both fire-and-forget (the enquiry is already
// saved, never block or throw on email):
//   1. Internal alert  -> ENQUIRY_ALERT_EMAIL (Matt), reply-to the enquirer.
//   2. Warm auto-reply -> the enquirer, reply-to CONTACT_EMAIL (Jessica).

import { getResend, FROM_ADDRESS } from './resend'
import { CONTACT_EMAIL, ENQUIRY_ALERT_EMAIL } from './constants'

export type AlertField = { label: string; value: string | number | null | undefined }

type EnquiryKind = 'school' | 'parent'

function renderFields(fields: AlertField[]): string {
  return fields
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== '')
    .map((f) => `${f.label}: ${f.value}`)
    .join('\n')
}

const SIGN_OFF = `Inspire. Empower. Shine.
Confidance
Building confidence through performing arts`

function schoolAutoReply(name: string): string {
  return `Hi ${name},

Thank you for getting in touch about bringing Confidance to your school.

We run after-school musical theatre clubs that help primary-school children grow in confidence, creativity and self-expression through singing, acting and dance.

Jessica will be in touch within two working days to talk through dates, year groups and a free taster session for your pupils.

If you would like to add anything in the meantime, just reply to this email.

${SIGN_OFF}`
}

function parentAutoReply(name: string): string {
  return `Hi ${name},

Thank you for registering your interest in Confidance.

We run after-school musical theatre clubs that help children grow in confidence, creativity and self-expression through singing, acting and dance. We open new clubs as we partner with more schools.

Jessica will be in touch as soon as there is a club near you, and we will keep you posted along the way.

If you would like to add anything in the meantime, just reply to this email.

${SIGN_OFF}`
}

export async function sendEnquiryEmails(opts: {
  kind: EnquiryKind
  enquirerName: string
  enquirerEmail: string
  alertSubject: string
  alertFields: AlertField[]
  ref: string
}): Promise<void> {
  // 1. Internal alert to Matt. reply-to the enquirer so a reply reaches them.
  try {
    const text = [
      `New ${opts.kind} enquiry via confidancecommunity.co.uk`,
      '',
      renderFields(opts.alertFields),
      '',
      `Reference: ${opts.ref}`,
    ].join('\n')

    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: ENQUIRY_ALERT_EMAIL,
      replyTo: opts.enquirerEmail,
      subject: opts.alertSubject,
      text,
    })
  } catch {
    // swallow: the enquiry persists regardless of email outcome
  }

  // 2. Warm auto-reply to the enquirer. reply-to Jessica, who handles it.
  try {
    const text =
      opts.kind === 'school'
        ? schoolAutoReply(opts.enquirerName)
        : parentAutoReply(opts.enquirerName)
    const subject =
      opts.kind === 'school'
        ? 'Thanks for your Confidance enquiry'
        : 'Thanks for registering your interest in Confidance'

    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: opts.enquirerEmail,
      replyTo: CONTACT_EMAIL,
      subject,
      text,
    })
  } catch {
    // swallow: a failed auto-reply must never break the submission
  }
}
