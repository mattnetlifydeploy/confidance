import { getResend, FROM_ADDRESS } from './resend'
import { auditLog } from './audit-log'
import { logAdminMessage } from './admin-messages'
import { CONTACT_EMAIL, CLASSES } from './constants'
import { getClassesMap } from './classes'
import type { ClassMap } from './classes'

export type PaymentFailedBooking = {
  id: string
  parent_id: string
  child_id: string
  class_type: string
  amount_paid_pence: number
}

export type PaymentFailedChild = { name: string }
export type PaymentFailedParent = { email: string; full_name: string | null }

export function formatPaymentFailed(
  booking: PaymentFailedBooking,
  child: PaymentFailedChild,
  parent: PaymentFailedParent,
  billingPortalUrl: string | null,
  classes: ClassMap = { ...CLASSES },
): { subject: string; text: string } {
  const meta = classes[booking.class_type] ?? null
  const className = meta ? meta.name : booking.class_type
  const greetingName = parent.full_name || 'there'
  const amount = `£${(booking.amount_paid_pence / 100).toFixed(2)}`

  let body = `Hi ${greetingName},

We tried to process payment for your Confidance booking, but it was unsuccessful.

Class: ${className}
Child: ${child.name}
Amount: ${amount}

To resolve this, please update your payment method. `

  if (billingPortalUrl) {
    body += `You can do this securely here: ${billingPortalUrl}`
  } else {
    body += `Please contact us at ${CONTACT_EMAIL} to reschedule your booking.`
  }

  body += `

If you have any questions, please don't hesitate to get in touch.

Thank you,
Confidance`

  return { subject: 'Payment issue with your Confidance booking', text: body }
}

export async function sendPaymentFailedEmail(
  booking: PaymentFailedBooking,
  child: PaymentFailedChild,
  parent: PaymentFailedParent,
  billingPortalUrl: string | null,
): Promise<void> {
  try {
    if (!parent.email) return
    const classes = await getClassesMap()
    const { subject, text } = formatPaymentFailed(booking, child, parent, billingPortalUrl, classes)
    const resend = getResend()
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: parent.email,
      subject,
      text,
    })
    const resendId = result.data?.id || null
    await logAdminMessage({
      sentBy: null,
      channel: 'email',
      audience: { bookingId: booking.id },
      subject,
      body: text,
      recipientCount: 1,
      resendId,
    })
    await auditLog(booking.parent_id, 'payment_failed_email', 'booking', booking.id, {
      to: parent.email,
      ok: !result.error,
      error: result.error ? result.error.message : null,
    })
  } catch {
    // fire-and-forget: a failed payment-failed email must never break webhook processing
  }
}
