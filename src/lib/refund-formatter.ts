export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

export type RefundRow = {
  date: string
  parentName: string
  parentEmail: string
  childName: string
  originalAmountPence: number
  refundAmountPence: number
  reason: string
  processedBy: string
}

export function formatRefundRow(
  auditDate: string,
  parentName: string,
  parentEmail: string,
  childName: string,
  originalAmountPence: number,
  refundAmountPence: number,
  reason: string,
  processedBy: string,
): RefundRow {
  return {
    date: auditDate,
    parentName,
    parentEmail,
    childName,
    originalAmountPence,
    refundAmountPence,
    reason,
    processedBy,
  }
}
