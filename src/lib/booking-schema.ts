import { z } from 'zod'

export const bookingSchema = z.object({
  parentName: z.string().min(2, 'Parent name is required'),
  parentEmail: z.string().email('Valid email required'),
  parentPhone: z.string().min(10, 'Valid phone number required'),
  emergencyContact: z.string().min(2, 'Emergency contact is required'),
  emergencyPhone: z.string().min(10, 'Emergency phone number required'),
  childName: z.string().min(2, 'Child name is required'),
  childAge: z.coerce.number().min(2, 'Minimum age is 2').max(6, 'Maximum age is 6'),
  classType: z.enum(['baby-boogie', 'confidance-kids'], {
    error: 'Please select a class type',
  }),
  medicalInfo: z.string().optional(),
  bookingType: z.enum(['free-trial', 'single-session', 'term-pass']),
  sessionDate: z.string().optional(),
  agreedToTerms: z.literal(true, {
    error: 'You must agree to the terms',
  }),
})

export type BookingFormData = z.infer<typeof bookingSchema>
