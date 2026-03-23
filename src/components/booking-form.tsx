'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/stripe'
import { CLASSES, VENUE, CURRENT_TERM, PRICING, getTermSessionDates, getRemainingSessionCount, getTermPrice, getNextTerm, getFullTermSessionCount } from '@/lib/constants'
import { bookingSchema, type BookingFormData } from '@/lib/booking-schema'

export function BookingForm() {
  const { user, profile, children, refreshChildren } = useAuth()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [trialUsed, setTrialUsed] = useState(false)
  const [form, setForm] = useState({
    classType: '' as 'baby-boogie' | 'confidance-kids' | '',
    bookingType: '' as 'free-trial' | 'single-session' | 'term-pass' | '',
    sessionDate: '',
    childId: '',
    childName: '',
    childAge: '',
    childMedical: '',
    emergencyContact: '',
    emergencyPhone: '',
    agreedToTerms: false,
    selectedTerm: 'current' as 'current' | 'next',
  })

  // Auto-fill emergency contact from profile
  useEffect(() => {
    if (profile && !form.emergencyContact && !form.emergencyPhone) {
      setForm((prev) => ({
        ...prev,
        emergencyContact: prev.emergencyContact || profile.full_name || '',
        emergencyPhone: prev.emergencyPhone || profile.phone || '',
      }))
    }
  }, [profile])

  // For adding a new child inline
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState('')
  const [newChildMedical, setNewChildMedical] = useState('')
  const [addingChild, setAddingChild] = useState(false)

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function checkTrialUsed(childId: string) {
    if (supabase && user) {
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .eq('booking_type', 'trial')
        .limit(1)
        .single()

      setTrialUsed(!!data)
    }
  }

  async function handleAddChild() {
    if (newChildName.length < 2) return
    const ageNum = parseInt(newChildAge)
    if (!ageNum || ageNum < 2 || ageNum > 6) return

    setAddingChild(true)
    if (supabase && user) {
      await supabase.from('children').insert({
        parent_id: user.id,
        name: newChildName,
        age: ageNum,
        medical_info: newChildMedical || null,
      })
      await refreshChildren()
    }
    setNewChildName('')
    setNewChildAge('')
    setNewChildMedical('')
    setShowAddChild(false)
    setAddingChild(false)
  }

  function validateStep(s: number): boolean {
    const stepErrors: Record<string, string> = {}

    if (s === 1) {
      if (!form.classType) stepErrors.classType = 'Please select a class'
    }

    if (s === 2) {
      if (!form.bookingType) stepErrors.bookingType = 'Please select a booking type'
      if (form.bookingType === 'single-session' && !form.sessionDate) stepErrors.sessionDate = 'Please select a session date'
    }

    if (s === 3) {
      let childIdToUse = form.childId
      if (!childIdToUse && form.childName) {
        const matchedChild = children.find((c) => c.name.toLowerCase() === form.childName.toLowerCase())
        childIdToUse = matchedChild?.id || ''
      }
      if (!childIdToUse && !form.childName) stepErrors.childId = 'Please select or add a child'
    }

    if (s === 4) {
      if (form.emergencyContact.length < 2) stepErrors.emergencyContact = 'Emergency contact required'
      if (!/^[\d\s+()-]{10,15}$/.test(form.emergencyPhone.trim())) stepErrors.emergencyPhone = 'Please enter a valid UK phone number'
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(step + 1)
  }

  async function handleSubmit() {
    if (!form.agreedToTerms) {
      setErrors({ agreedToTerms: 'You must agree to the terms' })
      return
    }

    setSaving(true)

    const childIdToUse = form.childId || children.find((c) => c.name.toLowerCase() === form.childName.toLowerCase())?.id
    if (!childIdToUse) {
      setErrors({ submit: 'Child not found' })
      setSaving(false)
      return
    }

    const selectedChild = children.find((c) => c.id === childIdToUse)

    try {
      const bookingId = crypto.randomUUID()
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingType: form.bookingType,
          classType: form.classType,
          sessionDate: form.sessionDate || undefined,
          childId: childIdToUse,
          childName: selectedChild?.name || form.childName,
          parentId: user?.id || '',
          parentEmail: profile?.email || '',
          emergencyContact: form.emergencyContact,
          emergencyPhone: form.emergencyPhone,
          selectedTerm: form.bookingType === 'term-pass' ? form.selectedTerm : undefined,
        }),
      })

      const result = await res.json()

      if (result.error) {
        setErrors({ submit: result.error })
        setSaving(false)
        return
      }

      // Free trial: redirect to success page
      if (form.bookingType === 'free-trial' && result.success) {
        const childName = selectedChild?.name || form.childName
        const className = form.classType === 'baby-boogie' ? 'Baby Boogie' : 'Confidance Kids'
        window.location.href = `/booking-success?type=trial&child=${encodeURIComponent(childName)}&class=${encodeURIComponent(className)}`
        return
      }

      // Single session or term pass: redirect to Stripe
      if (result.url) {
        window.location.href = result.url
      } else {
        setErrors({ submit: 'Payment setup failed' })
        setSaving(false)
      }
    } catch (err) {
      setErrors({ submit: 'Booking failed. Please try again.' })
      setSaving(false)
    }
  }

  const selectedChild = form.childId ? children.find((c) => c.id === form.childId) : null
  const sessionDates = getTermSessionDates(CURRENT_TERM)
  const nextTerm = getNextTerm()

  // Term pass pricing
  const currentTermRemaining = getRemainingSessionCount(CURRENT_TERM)
  const currentTermDates = getTermSessionDates(CURRENT_TERM).filter((d) => d >= new Date().toISOString().slice(0, 10))
  const nextTermDates = nextTerm ? getTermSessionDates(nextTerm) : []
  const nextTermTotal = nextTerm ? getFullTermSessionCount(nextTerm) : 0

  const termSessionCount = form.selectedTerm === 'next' && nextTerm ? nextTermTotal : currentTermRemaining
  const termPrice = termSessionCount * PRICING.term_session_price

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 font-heading text-2xl font-bold">Booking received!</h2>
        <p className="mt-4 text-charcoal-light">
          Thanks, {profile?.full_name?.split(' ')[0]}! We&apos;ve received your booking
          for {selectedChild?.name || form.childName}. You&apos;ll receive a confirmation email shortly.
        </p>
        <p className="mt-6 text-sm text-warm-gray">
          Questions? Email confidancejessica@gmail.com
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-10 flex items-center justify-between">
        {['Class', 'Booking', 'Child', 'Contact', 'Confirm'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm font-700 transition-all duration-300 ${
                step > i + 1
                  ? 'bg-green-100 text-green-600'
                  : step === i + 1
                    ? 'bg-gradient-to-br from-coral to-coral-dark text-white shadow-md'
                    : 'bg-cream text-warm-gray'
              }`}
            >
              {step > i + 1 ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="hidden font-heading text-xs font-600 sm:inline">{label}</span>
            {i < 4 && (
              <div className={`mx-2 hidden h-0.5 w-8 rounded sm:block ${step > i + 1 ? 'bg-green-200' : 'bg-cream-dark'}`} />
            )}
          </div>
        ))}
      </div>

      {errors.submit && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Step 1: Class Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="font-heading text-sm font-700">Class type</label>
            {errors.classType && <p className="mt-1 text-xs text-red-500">{errors.classType}</p>}
            <div className="mt-3 grid grid-cols-2 gap-4">
              {[
                { value: 'baby-boogie' as const, label: 'Baby Boogie', ages: 'Ages 2 to 4' },
                { value: 'confidance-kids' as const, label: 'Confidance Kids', ages: 'Ages 3 to 6' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update('classType', opt.value)}
                  className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                    form.classType === opt.value
                      ? 'border-coral bg-coral/5 shadow-sm'
                      : 'border-border hover:border-coral/30'
                  }`}
                >
                  <span className="font-heading text-sm font-700">{opt.label}</span>
                  <p className="mt-1 text-xs text-warm-gray">{opt.ages}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={nextStep} className="btn-primary w-full">
            Next: Choose Booking Type
          </button>
        </div>
      )}

      {/* Step 2: Booking Type */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="font-heading text-sm font-700">Booking type</label>
            {errors.bookingType && <p className="mt-1 text-xs text-red-500">{errors.bookingType}</p>}
            <div className="mt-3 space-y-3">
              {[
                { value: 'free-trial' as const, label: 'Free Trial', desc: 'One free class (per child)', price: 'Free' },
                { value: 'single-session' as const, label: 'Single Session', desc: 'Book one session', price: formatPrice(PRICING.single_session_price) },
                { value: 'term-pass' as const, label: 'Term Pass', desc: 'Remaining sessions at £10 each', price: 'Price varies' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    update('bookingType', opt.value)
                    if (opt.value !== 'free-trial') setTrialUsed(false)
                  }}
                  disabled={opt.value === 'free-trial' && trialUsed}
                  className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                    form.bookingType === opt.value
                      ? 'border-coral bg-coral/5 shadow-sm'
                      : 'border-border hover:border-coral/30'
                  } ${opt.value === 'free-trial' && trialUsed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading text-sm font-700">{opt.label}</span>
                      <p className="mt-1 text-xs text-warm-gray">{opt.desc}</p>
                    </div>
                    <span className="font-heading text-sm font-700 text-coral">{opt.price}</span>
                  </div>
                </button>
              ))}
              {trialUsed && (
                <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-3">
                  Your child has already used their free trial class.
                </p>
              )}
            </div>
          </div>

          {/* Single Session Date Picker */}
          {form.bookingType === 'single-session' && (
            <div>
              <label className="font-heading text-sm font-700">Select session date</label>
              {errors.sessionDate && <p className="mt-1 text-xs text-red-500">{errors.sessionDate}</p>}
              <select
                value={form.sessionDate}
                onChange={(e) => update('sessionDate', e.target.value)}
                className="auth-input mt-3"
              >
                <option value="">Choose a date</option>
                {sessionDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Term Pass Selector */}
          {form.bookingType === 'term-pass' && (
            <div className="space-y-4">
              <label className="font-heading text-sm font-700">Choose your term</label>

              {/* Current Term Card */}
              <button
                onClick={() => update('selectedTerm', 'current')}
                className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                  form.selectedTerm === 'current'
                    ? 'border-coral bg-coral/5 shadow-sm'
                    : 'border-border hover:border-coral/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-heading text-sm font-700">
                      {CURRENT_TERM.name} Term {CURRENT_TERM.year} (Remaining)
                    </span>
                    <p className="mt-1 text-xs text-warm-gray">
                      {currentTermRemaining} session{currentTermRemaining !== 1 ? 's' : ''} left at {formatPrice(PRICING.term_session_price)} each
                    </p>
                  </div>
                  <span className="font-heading text-sm font-700 text-coral">
                    {formatPrice(currentTermRemaining * PRICING.term_session_price)}
                  </span>
                </div>
                {currentTermDates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 overflow-hidden">
                    {currentTermDates.map((date) => (
                      <span key={date} className="rounded-lg bg-cream px-2 py-1 text-xs text-charcoal-light whitespace-nowrap">
                        {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {/* Next Term Card */}
              {nextTerm && (
                <button
                  onClick={() => update('selectedTerm', 'next')}
                  className={`w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                    form.selectedTerm === 'next'
                      ? 'border-coral bg-coral/5 shadow-sm'
                      : 'border-border hover:border-coral/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading text-sm font-700">
                        {nextTerm.name} Term {nextTerm.year} (Full Term)
                      </span>
                      <p className="mt-1 text-xs text-warm-gray">
                        {nextTermTotal} sessions at {formatPrice(PRICING.term_session_price)} each
                      </p>
                    </div>
                    <span className="font-heading text-sm font-700 text-coral">
                      {formatPrice(nextTermTotal * PRICING.term_session_price)}
                    </span>
                  </div>
                  {nextTermDates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 overflow-hidden">
                      {nextTermDates.map((date) => (
                        <span key={date} className="rounded-lg bg-cream px-2 py-1 text-xs text-charcoal-light whitespace-nowrap">
                          {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={nextStep} className="btn-primary flex-1">Next: Child Details</button>
          </div>
        </div>
      )}

      {/* Step 3: Child Selection/Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="font-heading text-sm font-700">Select your child</label>
            {errors.childId && <p className="mt-1 text-xs text-red-500">{errors.childId}</p>}

            {children.length === 0 && !showAddChild ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-charcoal-light">No children added yet</p>
                <button onClick={() => setShowAddChild(true)} className="btn-primary mt-4 text-sm">
                  Add Your Child
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {children
                  .filter((child) => {
                    if (!form.classType) return true
                    const classInfo = CLASSES[form.classType]
                    const [minAge, maxAge] = classInfo.ages.split(' to ').map(Number)
                    return child.age >= minAge && child.age <= maxAge
                  })
                  .map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      update('childId', child.id)
                      update('childName', child.name)
                      update('childAge', String(child.age))
                      checkTrialUsed(child.id)
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      form.childId === child.id
                        ? 'border-coral bg-coral/5 shadow-sm'
                        : 'border-border hover:border-coral/30'
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-lilac/20 font-heading text-sm font-bold text-coral">
                      {child.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-sm font-700">{child.name}</p>
                      <p className="text-xs text-warm-gray">Age {child.age}</p>
                    </div>
                    {form.childId === child.id && (
                      <svg className="h-5 w-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                {children.length > 0 && children.filter((child) => {
                  if (!form.classType) return true
                  const classInfo = CLASSES[form.classType]
                  const [minAge, maxAge] = classInfo.ages.split(' to ').map(Number)
                  return child.age >= minAge && child.age <= maxAge
                }).length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
                    <p className="text-sm text-charcoal-light">
                      None of your children are in the age range for{' '}
                      {form.classType === 'baby-boogie' ? 'Baby Boogie (ages 2-4)' : 'Confidance Kids (ages 3-6)'}.
                    </p>
                    <button onClick={() => setShowAddChild(true)} className="btn-primary mt-4 text-sm">
                      Add a Child
                    </button>
                  </div>
                )}
              </div>
            )}

            {!showAddChild && children.length > 0 && (
              <button
                onClick={() => setShowAddChild(true)}
                className="mt-4 font-heading text-sm font-600 text-coral transition-colors hover:text-coral-dark"
              >
                + Add another child
              </button>
            )}

            {showAddChild && (
              <div className="mt-4 rounded-2xl border border-border bg-cream/50 p-6 space-y-4">
                <h4 className="font-heading text-sm font-700">Add a child</h4>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="auth-input"
                  placeholder="Child's name"
                />
                <input
                  type="number"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                  className="auth-input"
                  placeholder="Age (2-6)"
                  min="2"
                  max="6"
                />
                <input
                  type="text"
                  value={newChildMedical}
                  onChange={(e) => setNewChildMedical(e.target.value)}
                  className="auth-input"
                  placeholder="Medical info (optional)"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowAddChild(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                  <button onClick={handleAddChild} disabled={addingChild} className="btn-primary flex-1 text-sm disabled:opacity-50">
                    {addingChild ? 'Adding...' : 'Add Child'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={nextStep} className="btn-primary flex-1">Next: Emergency Contact</button>
          </div>
        </div>
      )}

      {/* Step 4: Emergency Contact */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <label className="font-heading text-sm font-700">Emergency contact name</label>
            {errors.emergencyContact && <p className="mt-1 text-xs text-red-500">{errors.emergencyContact}</p>}
            <input
              type="text"
              value={form.emergencyContact}
              onChange={(e) => update('emergencyContact', e.target.value)}
              className="auth-input mt-2"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="font-heading text-sm font-700">Emergency contact phone</label>
            {errors.emergencyPhone && <p className="mt-1 text-xs text-red-500">{errors.emergencyPhone}</p>}
            <input
              type="tel"
              value={form.emergencyPhone}
              onChange={(e) => update('emergencyPhone', e.target.value)}
              className="auth-input mt-2"
              placeholder="Phone number"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
            <button onClick={nextStep} className="btn-primary flex-1">Next: Confirm</button>
          </div>
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-cream p-8">
            <h3 className="font-heading text-lg font-bold">Booking Summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow
                label="Class"
                value={form.classType === 'baby-boogie' ? 'Baby Boogie (Ages 2 to 4)' : 'Confidance Kids (Ages 3 to 6)'}
              />
              <SummaryRow
                label="Booking Type"
                value={
                  form.bookingType === 'free-trial'
                    ? 'Free Trial'
                    : form.bookingType === 'single-session'
                      ? 'Single Session'
                      : 'Term Pass'
                }
              />
              {form.bookingType === 'single-session' && (
                <SummaryRow
                  label="Date"
                  value={new Date(form.sessionDate).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
              )}
              {form.bookingType === 'term-pass' && (
                <SummaryRow
                  label="Term"
                  value={
                    form.selectedTerm === 'next' && nextTerm
                      ? `${nextTerm.name} ${nextTerm.year} (${nextTermTotal} sessions)`
                      : `${CURRENT_TERM.name} ${CURRENT_TERM.year} (${currentTermRemaining} remaining)`
                  }
                />
              )}
              <SummaryRow label="Child" value={`${selectedChild?.name || form.childName}, age ${selectedChild?.age || form.childAge}`} />
              <SummaryRow label="Parent" value={profile?.full_name || ''} />
              <SummaryRow label="Email" value={profile?.email || ''} />
              <SummaryRow label="Emergency" value={`${form.emergencyContact} (${form.emergencyPhone})`} />
              <div className="border-t border-border pt-3">
                <p className="font-heading text-xs font-700 text-warm-gray uppercase tracking-wide">{VENUE.name}</p>
                <p className="mt-1 text-xs text-charcoal-light">{VENUE.address}</p>
              </div>
              <SummaryRow
                label="Total"
                value={
                  form.bookingType === 'free-trial'
                    ? 'Free'
                    : form.bookingType === 'single-session'
                      ? formatPrice(PRICING.single_session_price)
                      : formatPrice(termPrice)
                }
                highlight
              />
            </dl>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) => update('agreedToTerms', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-coral"
            />
            <span className="text-sm text-charcoal-light">
              I confirm the information above is correct and agree to Confidance&apos;s
              terms and conditions. I understand that payment is required to secure
              the booking.
            </span>
          </label>
          {errors.agreedToTerms && <p className="text-xs text-red-500">{errors.agreedToTerms}</p>}

          <div className="flex gap-4">
            <button onClick={() => setStep(4)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Processing...' : `${form.bookingType === 'free-trial' ? 'Complete' : 'Pay'} & Book`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between pb-3 ${highlight ? 'pt-1 border-t border-border' : 'border-b border-border'}`}>
      <dt className={highlight ? 'font-heading font-700 text-charcoal' : 'text-warm-gray'}>{label}</dt>
      <dd className={highlight ? 'font-heading text-lg font-700 text-coral' : 'font-600 text-charcoal'}>{value}</dd>
    </div>
  )
}
