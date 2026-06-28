type ComputeTermPassPriceInput = {
  sessionCount: number
  pricePerSession: number
  siblingDiscountPct: number
  existingTermBookingsForParent: number
}

type ComputeTermPassPriceResult = {
  amount: number
  discountPct: number
  discountAmount: number
}

export function computeTermPassPrice(
  input: ComputeTermPassPriceInput,
): ComputeTermPassPriceResult {
  const base = input.sessionCount * input.pricePerSession
  const eligible = input.existingTermBookingsForParent >= 1 && input.siblingDiscountPct > 0
  const discountPct = eligible ? input.siblingDiscountPct : 0
  const discountAmount = Math.round((base * discountPct) / 100)
  const amount = base - discountAmount
  return { amount, discountPct, discountAmount }
}
