import { z } from 'zod'

// ─── Row type (new table not yet in database.types.ts) ───

export const PARENT_INTEREST_STATUSES = [
  'new',
  'contacted',
  'interested',
  'signed',
  'lost',
] as const
export type ParentInterestStatus = (typeof PARENT_INTEREST_STATUSES)[number]

export const PARENT_INTEREST_STATUS_LABELS: Record<ParentInterestStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  signed: 'Signed up',
  lost: 'Lost',
}

export type ParentInterest = {
  id: string
  parent_name: string
  parent_email: string
  parent_phone: string | null
  child_year_group: string | null
  preferred_school: string | null
  postcode: string | null
  message: string | null
  status: ParentInterestStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

// ─── Public "register interest" form (client-safe, no supabase import) ───

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

export const parentInterestInputSchema = z.object({
  parentName: z.string().trim().min(2, 'Please enter your name').max(120),
  parentEmail: z.string().trim().email('Please enter a valid email address').max(200),
  parentPhone: optionalText(40),
  childYearGroup: optionalText(80),
  preferredSchool: optionalText(200),
  postcode: optionalText(20),
  message: optionalText(3000),
  // Honeypot: real users never see this field. Bots that fill it get dropped.
  website: z.string().optional(),
})

export type ParentInterestInput = z.infer<typeof parentInterestInputSchema>
