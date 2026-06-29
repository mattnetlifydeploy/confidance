import { z } from 'zod'

// ─── Row types (new tables not yet in database.types.ts) ───

export type School = {
  id: string
  name: string
  slug: string
  address: string | null
  postcode: string | null
  area: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  school_type: string | null
  active: boolean
  notes: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'interested',
  'signed',
  'rejected',
] as const
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  signed: 'Signed up',
  rejected: 'Not proceeding',
}

export type SchoolEnquiry = {
  id: string
  school_name: string
  school_type: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  estimated_students: number | null
  preferred_days_times: string | null
  notes: string | null
  status: EnquiryStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

// ─── Public "For Schools" enquiry form (client-safe, no supabase import) ───

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

export const enquiryInputSchema = z.object({
  schoolName: z.string().trim().min(2, 'Please enter your school name').max(200),
  schoolType: optionalText(100),
  contactName: z.string().trim().min(2, 'Please enter your name').max(120),
  contactEmail: z.string().trim().email('Please enter a valid email address').max(200),
  contactPhone: optionalText(40),
  estimatedStudents: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(0).max(100000).optional(),
  ),
  preferredDaysTimes: optionalText(500),
  notes: optionalText(3000),
  // Honeypot: real users never see this field. Bots that fill it get dropped.
  website: z.string().optional(),
})

export type EnquiryInput = z.infer<typeof enquiryInputSchema>
