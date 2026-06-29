# Confidance Repositioning & Redesign Plan

> STATUS: FINAL / APPROVED (2026-06-29). Ready to build.
>
> LOCKED DECISIONS:
> - Booking model: lightweight schools-as-venues. Schools lend space only. All booking and payment via the Confidance site. No school logins, portals, or payments. "Schools loading" placeholder until the first school signs.
> - Brand: Jessica's real poster brand. Navy #173B4C + teal #2E8FA3 + pale blue #DCEBF0 + white, charcoal text. "CONFI" navy / "DANCE" teal wordmark. Tagline "Building confidence through performing arts". Motif "INSPIRE. EMPOWER. SHINE."
> - Class capacity: 15 children per class. Update MAX_BOOKINGS_PER_CLASS from 12 to 15 in src/lib/constants.ts during build.
> - Pricing: KEEP CURRENT (term pass per-session and single-session pricing unchanged). The free taster maps to the existing free-trial booking type.
> - Assets: no new assets from the client. Build from the existing live site media + Jessica's poster + the Partnership Pack copy only.
> - Build order: POSTER FIRST (already designed by Jessica; only the website field needs the live URL), then Phase 0 brand lock through the house build skills + gates, shipping to live prod at https://www.confidancecommunity.co.uk.

## A. SUMMARY

**Old product positioning:** Confidance is a children's dance and confidence class offering, run from one fixed venue (Grove Neighbourhood Centre in Hammersmith) for ages 2-6, with booking via a parent-facing web app.

**New product positioning:** Confidance is a musical theatre performer (Jessica) offering after-school confidence-building performing arts clubs (singing, acting, dance) hosted at schools across the region. Parents book their children into clubs at participating schools. The web app becomes a platform connecting schools (who host and want to attract families), parents (who book children into clubs at their preferred school), and Jessica (who manages the programme, rosters, and billing).

**Key shift:** From a single-venue offering to a multi-venue (schools-as-venues) model. Jessica becomes the visible face and credentials. The site must impress both schools (to register interest) and parents (to book children). All 18 existing features (reminders, waivers, capacity, attendance, refunds, etc.) are preserved; the data model gains school/venue records, enquiry management, and parent-level venue selection.

---

## B. CONFIRMED: BOOKING/VENUE MODEL

**Confirmed lightweight model (per Jessica):** Schools are purely locations/venues. They let Jessica use their space for classes. All booking and payment happens through Jessica's Confidance website. Schools do not handle payment, do not have admin logins, do not see a portal, and do not take a cut.

- Existing setup: One hardcoded venue (Grove Neighbourhood Centre).
- New setup: Support multiple school-venues. Parents pick the school location when booking (school dropdown, same booking flow, just with venue selection added).
- Schools role: Express interest via a simple "For Schools" enquiry form (email, phone, notes). This generates a lead in Jessica's admin inbox. Jessica follows up, negotiates timing, then activates the school in the app.
- "Schools loading" placeholder: Appears on /schools, /classes, and /book pages until the first school signs up. Design: large icon, heading "More schools coming soon", body "Jessica is partnering with local schools to bring performing arts clubs to your area."
- No white-label, no franchise portal, no school billing logic. This is the simplest model and is now confirmed.

---

## C. BRAND & POSITIONING

### Name & Tagline
**Confidance** (unchanged). 

**Tagline:** "Building confidence through performing arts" (exact, per Jessica's poster).

### Elevator Pitch
Jessica, a professional musical theatre performer, leads after-school performing arts clubs in local schools, building children's confidence through singing, acting, and dance.

### Two Audiences
1. **Schools** (decision-makers): heads, activity coordinators, PAs. They want a professional provider with credentials, a proven curriculum, and zero admin burden.
2. **Parents** (bookers): guardians of children aged 4-12+ in participating schools. They want to see Jessica's background, find available clubs at their child's school, book easily, and track attendance/progress.

### Tone of Voice
- Professional but warm. Confidance is a trusted, experienced provider (Jessica is a real performer with credentials), not a startup experiment.
- Focus on confidence-building and creative development, not just fun.
- Schools messaging: partnership, support, proven outcomes, zero hassle.
- Parent messaging: performer-led quality, skill-building, school-community integration.

### Visual System (Brand Tokens)

#### Wordmark & Logo
**"CONFIDANCE"** in uppercase, letter-spaced, two-tone split:
- "CONFI" in deep navy (approx #173B4C).
- "DANCE" in bright teal (approx #2E8FA3).
This plays on confidence + dance and is the source of truth from Jessica's poster.

#### Fonts
- **Display/Headings:** Clean geometric sans-serif (Montserrat / Poppins / Outfit style). Uppercase, letter-spaced. Used for wordmark, section headings, landing-page headlines.
- **Body & UI:** Clean, readable sans-serif (e.g., Outfit, Inter). Professional but approachable.
- **Accent/Pull-quotes:** Handwritten script font (teal colour) for motivational quotes. Jessica's poster uses "Enriching young lives through performing arts" in script; use this style for brand accents.

#### Colour Palette
- **Primary navy / petrol:** #173B4C (headers, footer band, "CONFI" wordmark, text on light backgrounds, section dividers).
- **Teal accent:** #2E8FA3 ("DANCE" wordmark, icons, button highlights, links, circular badges, action highlights).
- **Pale blue / soft background:** #DCEBF0 (badge backgrounds, section washes, soft card accents).
- **White / very light background:** Off-white for main content areas, light gray for subtle dividers.
- **Text:** Charcoal (no pure black per house rules).
- **Semantic status colours:** Green #4CAF50 (success), red #EF4444 (error), amber #F59E0B (warning), blue #3B82F6 (info).

**Rationale:** Navy + teal is clean, professional, and education-sector appropriate. Evokes trust, creativity, and stage/performing arts without being garish. All colours sit below 80% saturation (muted, refined).

#### Brand Motif
**"INSPIRE. EMPOWER. SHINE."** A recurring strapline badge from Jessica's poster. Use as a decorative motif on hero sections, postcards, social media, and the poster itself.

#### Radius & Shadows
- **Border radius:** 12px for cards/buttons, 8px for form inputs, 4px for small interactive elements.
- **Shadows:** Subtle layered (xs: 0 1px 2px rgba(0,0,0,0.05), sm: 0 1px 3px rgba(0,0,0,0.08), md: 0 4px 6px rgba(0,0,0,0.1)). No drop shadows > md.
- **Card background:** White or very pale blue (#DCEBF0) for breathing room. Double-bezel: white card with thin teal border (1px rgba(46, 143, 163, 0.15)) inside a subtle pale-blue wash.

#### Spacing & Layout
- **Section padding:** py-24 (minimum); py-32 on hero. px-6 on mobile, px-8 tablet, px-12 on desktop. Max-width container: 1280px (xl in Tailwind).
- **Component spacing:** Generous. Cards have 20-24px internal padding. Form fields have 16px vertical gap. Buttons are 48-56px width minimum, 44px height (accessibility).

#### Motion
- **Spring physics:** easeOut cubic-bezier(0.16, 1, 0.3, 1) for most transitions (600ms). easeSpring cubic-bezier(0.34, 1.56, 0.64, 1) for card lifts, list reveals (400-500ms).
- **Entrance:** Staggered fade + slide-up on scroll (Intersection Observer). Elements reveal in order (h1 -> p -> buttons -> badges) over 200-300ms each, 80ms apart.
- **Hover:** Subtle lift (transform: translateY(-2px)), shadow intensification, colour shift on interactive elements.
- **Skeleton/loading:** Pulse animation (opacity 0.5 to 1 over 1.5s) with gradient shimmer overlay; no spinning spinners.

---

## D. PUBLIC SITE: PAGE BY PAGE

### Existing Pages (Changes Required)

#### 1. Homepage (`/`)
**Purpose:** Convert from "children's classes at one venue" to "Jessica's after-school clubs across multiple schools."

**Current state:** Hero says "Little dancers. Big confidence." with centered blobs, animated bubbles, trust badges, CTA buttons.

**Changes:**
- Hero redesign: Left-aligned headline + right-side atmospheric image or stage/spotlight visual (use existing live-site imagery, Jessica's performer photo if available, or stage lighting motif).
- Hero heading: "Build Confidence. Discover Your Stage" (or similar; use Jessica's final copy preference).
- Tagline: "Building confidence through performing arts." Subheading: "Professional performing arts clubs in partner schools."
- Update trust badges to performer credentials: "Musical Theatre Performer", "First Class Honours Graduate", "Enhanced DBS", "Schools Partner".
- CTAs: Primary button "Register Your School" (leads to /for-schools enquiry form), Secondary "Browse Clubs" (leads to /schools).
- Remove animated bubbles. Replace with single large spotlight gradient or stage curtain motif in background (subtle, not cartoonish).
- Update marquee text to theatre/school-focused: "Professional performer", "School partnerships", "Structured curriculum", "DBS verified", "Parents trust us".
- Add "Featured Schools" carousel section (small, below fold). Shows logos/names of schools. Empty state: placeholder text "Schools coming soon".

**Copy direction (from poster + partnership pack):**
- "Jessica, a classically trained musical theatre performer, leads performing arts clubs in partner schools. Through singing, acting, and dance, children build confidence, creativity, and stage presence."
- Emphasize both audiences: Parents can "find a club at your child's school", schools can "register to host a professional programme."

#### 2. Classes / Schools Discovery Page (`/schools` or `/clubs`)
**Purpose:** Show available clubs grouped by school/venue.

**Current state:** Simple grid listing classes (Baby Boogie, Confidance Kids).

**Changes:**
- Rename to `/schools`; breadcrumb: Home > Schools.
- **When no schools exist (launch state):** Display prominent "Schools Loading" section. Design: large icon (school building or upward arrow), heading "More schools coming soon", body "Jessica is partnering with local schools to bring performing arts clubs to your area. Schools are currently registering." CTA: "Register Your School" (links to /for-schools).
- **When schools exist:** Display schools as cards or list (name, address, photo, club count, next booking date). Click to expand and see classes at that school (age group, day/time, price, availability, "Book Now" button).
- Remove generic "Baby Boogie" / "Confidance Kids" top-level class presentation. Classes exist only within a school context.
- Copy: "Find a club at your child's school."

#### 3. Booking Flow (`/book`, `/booking-success`)
**Purpose:** Adapt to multi-venue. Parent selects a school first, then a class.

**Current state:** Form has class selection, child details, term, ticket type, sibling pricing.

**Changes:**
- Add **school/venue selector** as the first step (before class selection).
- Label: "Select the school where your child attends" (searchable dropdown or radio-button list).
- Require login first (auto-fill child age and family data from profile).
- After school selection, filter available classes to that school only.
- Preserve all downstream logic: class selection -> child details -> term -> ticket type -> payment (including sibling discount).
- If no schools exist: show "Schools Loading" state with helpful message.
- Success page: thank parent, show confirmation prominently including school location.

#### 4. About (`/about`)
**Purpose:** Focus on Jessica's performer background.

**Action:** Adapt existing about page to emphasize Jessica's credentials, not generic company info. See `/about-jessica` below for full content.

#### 5. FAQs (`/faqs`)
**Purpose:** Help parents and schools.

**Changes:**
- Add toggle/tab: "For Parents" vs. "For Schools".
- **For Parents:** Existing Qs about booking, refunds, age ranges, etc. Add: "What classes are available?", "Do you offer classes at my school?", "Can my child join a waitlist?", etc.
- **For Schools:** New section with Qs from the Partnership Pack. Example Qs: "How much space do you need?", "How many children per class?", "What do you provide?", "Do we pay you or handle billing?", etc. (Below in the content matrix, derived from Partnership Pack.)

#### 6. Account / Dashboard Pages (`/account`, `/dashboard`)
**Purpose:** Parent manages child's club membership(s).

**Changes:**
- Add "School" column or badge to class/booking displays (e.g., "Confidance Kids at [School Name]").
- If parent has children at multiple schools, dashboard shows all clubs across all schools.
- Add "view school" link to `/schools/[school-id]` to see other clubs at the same school.
- Preserve all existing: payment history, invoices, attendance, reschedule, refund, family notes, account delete/export.

#### 7. Privacy / Terms (`/privacy`, `/terms`)
**Purpose:** Legal.

**Changes:**
- Update references from "Grove Neighbourhood Centre" to "partner schools" or "host venues".
- Add: "We collect and store information about which schools your child's clubs are hosted at, for administrative and billing purposes."

### New Pages (Required)

#### 8. For Schools (`/for-schools`)
**Purpose:** Pitch the programme to school decision-makers. Content mirrors the Partnership Pack structure.

**Content & copy (from Partnership Pack):**

1. **Hero:** "Professional Performing Arts Clubs for Your School" (Montserrat/Poppins uppercase heading). Subheading: "Partner with Jessica to bring confidence-building performing arts to your students." Background: stage/curtain or school photo. CTA: "Register Your School" (prominent button, to enquiry form).

2. **Welcome / Why Performing Arts:** Short intro. Emphasize benefits to children per Partnership Pack: Confidence, Communication, Creativity, Teamwork, Resilience, Wellbeing. (Not just "fun dancing".)

3. **About Jessica (excerpt):** Professional photo + bio. "Hi, I'm Jess! Musical Theatre Performer and Children's Performing Arts Teacher. I currently teach ballet to children aged 2-6 and musical theatre to children aged 6-9 across London. My goal is to create a positive, encouraging space where children build confidence, express themselves and discover the joy of performing arts." Link to full bio at /about-jessica.

4. **Our After-School Clubs:** Suitable for KS1 and KS2. 1-hour weekly sessions after school. Led by a Musical Theatre performer. Inclusive and welcoming to all. End-of-term performance opportunities (optional). Up to 15 children per class. Free taster session available to each school.

5. **What Does a Session Look Like?** (from Partnership Pack). Timeline: Welcome -> Warm Up -> Drama Games -> Singing -> Dance -> Performance -> Reflection. "Schools LOVE seeing structure."

6. **Why Partner With Confidance?** 4-5 cards (double-bezel design):
   - "Fully Planned Curriculum": "No extra planning or resources needed."
   - "Professional Performer": "Classically trained, DBS verified, insured."
   - "We Handle Everything": "Confidance deals with all bookings, billing, reminders, and parent communication. Simple, reliable, stress-free for schools."
   - "Supports PSHE & Personal Development": "Promotes communication, creativity, teamwork, self-expression, confidence."
   - "Flexible to Your School": "We work around your year groups, timings, and space."

7. **Safeguarding & Professional Standards:** Show/mention Enhanced DBS, Public Liability Insurance, Safeguarding Training, Risk Assessments, Policies, Emergency Procedures. (Text may say "coming soon" for items being finalized; showing the page proves competence.)

8. **Frequently Asked Questions (for schools):**
   - "Do parents pay the school?" No. Confidance deals with all bookings directly.
   - "What room do you need?" Anything with space. A school hall, dance studio, or drama room. Anything with a good floor for physical activity.
   - "How many children?" Up to 15 children per class.
   - "What equipment is required?" None. Confidance brings all equipment.
   - "Can we offer a free taster?" Yes. Each school has a free taster session available.

9. **Enquiry Form (bottom of page):**
   - School name (required)
   - School type (primary / secondary / other) (required)
   - Contact person name (required)
   - Contact email (required)
   - Contact phone (optional)
   - Estimated number of interested students (optional)
   - Preferred days/times (optional)
   - Any notes/questions (optional)
   - Submit -> Save to school_enquiries table in DB -> Email to confidancejessica@gmail.com
   - After submit: thank-you message with next steps. "Thanks for registering! Jessica will be in touch within X business days."

**Design:** Premium, professional, sales-focused. Use double-bezel cards, teal accents, script quotes, navy headings. Full-width sections with generous padding. Make it obvious that this is a well-run, established programme.

#### 9. About Jessica (`/about-jessica`)
**Purpose:** Establish credibility. Single-page biography + credentials + media (reusing existing live-site imagery, no new assets needed).

**Content (from Partnership Pack + poster):**
- Professional headshot (use existing Jessica photo from live site if available) + action shot of Jessica performing (use existing performance imagery).
- Bio paragraph: "Hi, I'm Jess! Musical Theatre Performer and Children's Performing Arts Teacher. I currently teach ballet to children aged 2-6 and musical theatre to children aged 6-9 across London. My goal is to create a positive, encouraging space where children build confidence, express themselves and discover the joy of performing arts."
- Credentials/Experience: Training (First Class Honours degree in [subject], if known), certifications, Enhanced DBS check, insurance status, years teaching, companies worked with (if any; use existing credits from live site), number of students taught.
- Philosophy: Why she loves working with children, approach to confidence-building.
- Media: If existing video of Jessica teaching or performing is on live site, embed or link it. Otherwise, note "coming soon" or skip if not available. No new media required.
- Testimonials: If existing parent/school testimonials exist on live site, feature them. Otherwise, placeholder.

**Design:** Split layout. Left: large photo. Right: text (Montserrat headings, clean sans-serif body). Minimal, gallery-like, premium feel.

#### 10. Schools/Venues Detail Routes (`/schools/[school-id]`)
**Purpose:** Parent can view details of a specific school and its classes.

**Content:**
- School name, address, area, photo/building image.
- List of active classes at that school: type, day/time, capacity, enrolled count, "Book Now" button.
- Contact info (school admin contact, not parents; for informational purposes).
- Empty state: "No active clubs yet. Check back soon or contact us to express interest."

---

## E. SCHOOLS MODEL: DATA & FLOW

### Conceptual Model

**Before:** Single venue (Grove). Classes grouped by type (Baby Boogie, Confidance Kids). Bookings reference class_type + term. Admin manages one location's timetable.

**After:** Multiple schools (venues). Each school can host multiple classes. A "class" record belongs to a specific school. A "booking" references both a school and a class. Admin can enable/disable schools, view enquiries, manage classes per school.

### "Schools Loading" Placeholder

- **Display:** On `/schools`, `/classes`, `/book` pages when no schools exist (count = 0).
- **Design:** Large icon (school building or upward arrow), heading "More schools coming soon", body "Jessica is currently partnering with local schools to bring performing arts clubs to your area.", CTA "Register Your School" to /for-schools.
- **Admin view:** Dashboard banner: "No active schools yet. School enquiries can be viewed in the Enquiries inbox."

### Schools Enquiry Flow

**Trigger:** School admin (or someone from a school) fills out the `/for-schools` enquiry form.

**Data capture:** School name, school type, contact person, email, phone, estimated student count, preferred days/times, notes.

**Storage:** New database table `school_enquiries`.

**Columns:**
- `id` (UUID primary key)
- `created_at` (timestamp)
- `school_name` (string)
- `school_type` (enum: primary, secondary, other)
- `contact_name` (string)
- `contact_email` (string)
- `contact_phone` (string, nullable)
- `estimated_students` (integer, nullable)
- `preferred_days_times` (text, nullable)
- `notes` (text, nullable)
- `status` (enum: new, contacted, interested, signed, rejected; default 'new') -- admin updates
- `admin_notes` (text, nullable) -- Jessica's internal notes
- `assigned_to` (UUID, foreign key to admin user, nullable) -- future: team collaboration

**After submission:**
- Email sent to confidancejessica@gmail.com via Resend: subject "New School Enquiry: [School Name]", body includes all form data + link to admin inbox.
- Form shows thank-you message: "Thanks for registering! Jessica will be in touch within [X] business days."

**Admin side:** New section in admin dashboard called "School Enquiries". Shows enquiries list, filterable by status. Admin can:
- View enquiry details.
- Update status.
- Add internal notes.
- Once signed, create a "School" record in schools table (linked to this enquiry).

### Parent Booking with School Selection

**Current flow:** Class selection -> child details -> term -> ticket type -> payment.

**New flow:**
1. Login (auto-fills child age from profile).
2. School selection: Searchable dropdown or radio list: "What school does your child attend?" -> select one.
3. Class selection: Filtered by selected school. "Choose a class" -> available classes at that school.
4. [Remaining steps: child details -> term -> ticket type -> payment.]

**Implementation:** Add `school_id` (UUID FK) to both `classes` and `bookings` tables. Classes table: `school_id` indicates which school hosts that class. Bookings table: `school_id` denormalized for query speed (derived from class.school_id but kept for performance).

### Data Model Changes (in plain English)

**New tables:**
- `schools`: id, name, address, postcode, area, contact_name, contact_email, contact_phone, setup_date, active (boolean), notes, logo_url, school_type (enum), capacity_notes.
- `school_enquiries`: (as above).

**Modified tables:**
- `classes`: add `school_id` (FK to schools). Each class belongs to one school.
- `bookings`: add `school_id` (FK to schools). Denormalized for query speed.

**Unchanged:** `profiles`, `children`, `terms`, `pricing`, `waitlists`, `term_exclusions`, `admin_messages_log`, `attendance`, `invoices`, `refunds`.

### Migration Checklist

**Migrations start at 015 (002-014 already used). All migrations must be reversible (down function).**

1. **Migration 015: Create schools and school_enquiries tables.**
   - Create `schools` table (id UUID primary key, name TEXT not null, address TEXT, postcode TEXT, area TEXT, contact_name TEXT, contact_email TEXT, contact_phone TEXT, setup_date TIMESTAMP default now(), active BOOLEAN default false, notes TEXT, logo_url TEXT, school_type ENUM, capacity_notes TEXT, created_at TIMESTAMP default now()).
   - Create `school_enquiries` table (id, created_at, school_name, school_type, contact_name, contact_email, contact_phone, estimated_students, preferred_days_times, notes, status, admin_notes, assigned_to).
   - Create indexes: schools(active), school_enquiries(status, created_at).

2. **Migration 016: Add school_id to classes.**
   - Add `school_id` column to `classes` (UUID FK, nullable initially).
   - Create "Grove Neighbourhood Centre" school record for backward compatibility.
   - Backfill all existing classes to Grove school ID.
   - Create index: classes(school_id).

3. **Migration 017: Add school_id to bookings.**
   - Add `school_id` column to `bookings` (UUID FK, nullable initially).
   - Backfill all existing bookings from classes.school_id.
   - Create index: bookings(school_id).
   - Add NOT NULL constraint to both school_id columns.

**Risk mitigation:** Test migration on staging DB first. Verify all bookings/classes have school_id post-migration. Run integrity checks.

---

## F. ADMIN OVERHAUL: PAGE BY PAGE

### Shared Admin Design System

All admin pages use a **unified premium design system:**

- **Sidebar:** Fixed left (220px), dark navy (#173B4C) bg, off-white text. Logo at top. Menu items with hover (pale-blue bg #DCEBF0, navy text). Active item: teal background + underline. Icons: Lucide.
- **Top bar:** White bg, subtle border, breadcrumb + user name + logout. Responsive (sidebar collapses on mobile).
- **Cards:** Double-bezel (white card with thin teal border 1px inside pale-blue wash). Section heading in Montserrat 24px, body in sans-serif 16px. Generous padding 24px.
- **Tables:** Sans-serif body, light gray dividers, teal header row (white text). Hover: pale-blue row bg. Sortable columns.
- **Buttons:** Consistent with public site. Primary: teal #2E8FA3 bg, white text, 12px border-radius. Secondary: outline, teal border, teal text. Hover: slight lift + shadow.
- **Forms:** Sans-serif. Labels in teal #2E8FA3. Input borders: light gray or teal (focus). Validation: red error text + icon.
- **Empty states:** Centered icon + heading + body copy + CTA.
- **Toasts:** Slide from top-right. Semantic colours (green success, red error, amber warning, blue info). Dismiss button. Auto-dismiss 6s.

### Admin Pages (Existing + New)

#### 1. Dashboard (`/admin`)
**Status:** Existing; restyle + add schools content.

**Content:**
- **Schools summary card:** "X active schools, Y pending enquiries, Z contacted."
- **Classes card:** "X classes running this term, Y spaces filled, Z waitlist."
- **Upcoming sessions:** Next 5 classes, attendance status.
- **Revenue:** £X bookings, £Y paid, £Z outstanding.
- **Action items:** "2 schools need follow-up", "1 waitlist to confirm", "3 failed payments", etc.
- **School enquiries:** "You have 2 new enquiries" (link to /admin/enquiries).

All cards follow double-bezel design. Apply Montserrat + teal palette.

#### 2. Schools / Venues Management (`/admin/schools`)
**Status:** NEW. CRUD for schools.

**Content:**
- List of all schools (active and inactive).
- Columns: name, location (address), active status, contact person, # classes, # bookings, actions (edit, deactivate, view details).
- "Add School" button (top right) opens form modal.
- Click a school to view/edit: name, address, postcode, area, contact details, logo upload, school type, capacity notes, active toggle, internal notes.
- Actions: save, delete (with confirmation), view linked enquiry (if applicable).

#### 3. School Enquiries Inbox (`/admin/enquiries`)
**Status:** NEW. Manage inbound school enquiries.

**Content:**
- List: school name, contact person, date, status (new/contacted/interested/signed/rejected), actions.
- Filter by status.
- Click enquiry to view full details: school name/type, contact info, estimated students, preferred days/times, notes.
- Update status dropdown, admin notes textarea, "Assign to" dropdown.
- "Send Email" CTA (pre-fills template to contact_email).
- Once status=signed: "Create School Record" button (creates school in Schools page, linked to this enquiry).
- Empty state: "No enquiries yet. Share your For Schools page to receive enquiries."

#### 4. Classes / Timetable (`/admin/classes`)
**Status:** Existing; restyle + add school filter.

**Changes:**
- Add "School" column and filter dropdown (All Schools / select one).
- "Create Class" form now includes school selector (dropdown) as required field.
- List: school, class name, day/time, capacity, enrolled/waitlist, actions.
- Filter/sort by school, class type, day, term.

#### 5. Bookings (`/admin/bookings`)
**Status:** Existing; restyle + add school filter.

**Changes:**
- Add "School" column and filter dropdown.
- Bookings list: child name, parent name, school, class, term, booking type, price, status, actions.
- Preserve all existing: reschedule, cancel, refund, payment status.

#### 6. Attendance (`/admin/attendance`)
**Status:** Existing; restyle + add school filter.

**Changes:**
- Add "School" column and filter dropdown.
- Preserve attendance marking logic.

#### 7. Messages Log (`/admin/messages`)
**Status:** Existing; restyle + minor enhancements.

**Changes:**
- Add "School" filter. Add "Sent via" column. Apply new admin design system.

#### 8. Payments / Invoices (`/admin/payments`)
**Status:** Existing; restyle + add school filter.

**Changes:**
- Add "School" column and filter.
- Show: booking id, parent name, school, class, term, invoice amount, payment status (paid/pending/failed), due date, actions.
- Preserve refund/recovery logic.

#### 9. Reports / Analytics (`/admin/reports`)
**Status:** Existing; restyle + minor enhancements.

**Content:**
- By-school table: school name, # active children, # bookings this term, revenue, attendance rate.
- By-term summary: total revenue, total students, attendance rate, cancellations/refunds.
- Export CSV button (filtered by school/term).

#### 10. Account Settings (`/admin/settings`)
**Status:** Existing; restyle + minor additions.

**Changes:**
- Add "Default School" setting (legacy, for unspecified school context; initially "Grove Neighbourhood Centre").
- Preserve existing: pricing, sibling discount %, max bookings per class, SMTP/Resend config.

---

## G. THE POSTER

### Status
**Jessica has already designed an A4 poster** that serves as the brand source of truth. The only outdated element is the website field, currently "UNDER CONSTRUCTION", which should become the live URL (https://www.confidancecommunity.co.uk) once the site ships.

### What's Needed
1. **Print-ready A4 PDF (updated):** Take Jessica's existing poster design, update the website URL to the live domain, and ensure it's formatted for print (CMYK, 300 dpi).
2. **Digital/Social version (optional, low priority):** Create a social media version (1080x1350px, RGB, 72 dpi) using house `poster-builder` or `graphic-design` skill, matching the final site's brand tokens (navy + teal, Montserrat headings, script accents). This is nice-to-have but not critical.

### Production
- **Skill routing:** If an updated/digital version is needed, use house `poster-builder` skill. Provide designer with: Jessica's existing poster image (as reference), updated website URL, colour tokens (navy #173B4C, teal #2E8FA3, cream/white), fonts (Montserrat, script), and the "INSPIRE. EMPOWER. SHINE." badge motif.
- **Deliverables:** 
  - `confidance-schools-poster-a4-updated.pdf` (Jessica's poster with live URL).
  - `confidance-schools-poster-social.png` (optional; Instagram story template, 1080x1350px).

---

## H. EXECUTION ROADMAP

### Phase 0: Brand Lock & Asset Collection (3-5 days)
**Deliverables:** Design tokens confirmed, visual guidelines documented, existing imagery identified.

**Tasks:**
- Confirm fonts (Montserrat for headings, clean sans for body, script for accents) and colour tokens (navy #173B4C, teal #2E8FA3, pale-blue #DCEBF0).
- Get Jessica's approval on visual direction and copy.
- Asset inventory: identify existing photos, videos, and imagery on live site (hero video, performer photos, class images).
- Create brand guideline doc (1 page): fonts, colours with hex, spacing scale, motion principles, examples.
- Note: No new assets needed. Use existing live-site media + Jessica's poster.

**Owner decision:** Any copy refinements beyond what's in the poster + Partnership Pack?

### Phase 1: Copy & Content (2-3 days)
**Deliverables:** Finalized copy for all pages.

**Tasks:**
- Write/refine homepage hero copy (tagline confirmed as "Building confidence through performing arts").
- Write /for-schools page copy (mirror Partnership Pack structure: Welcome, Why Performing Arts, About Jess excerpt, Clubs, Session Timeline, Why Partner, Safeguarding, FAQ, Enquiry).
- Write /about-jessica page copy (bio from Partnership Pack + poster).
- Update FAQs (Parents tab + Schools tab).
- Refine all page metadata (titles, descriptions).
- Get Jessica's approval on all copy.

**Owner decision:** Confirm 15 children per class (from Partnership Pack) vs. existing app setting of 12. Which number should the app enforce?

### Phase 2: Public Site Redesign (5-7 days)
**Deliverables:** Full visual overhaul of public site. Built, styled, responsive.

**Tasks:**
- Redesign homepage (left-aligned hero, new tagline, new CTAs, featured schools carousel [empty state], new trust marquee, stage motif background).
- Build /for-schools page (hero, why-cards, how-it-works timeline, what's-included, testimonials placeholder, enquiry form with validation and submit).
- Build /about-jessica page (photo + bio layout, credentials, media embeds, links).
- Build /schools page (empty state "Schools Loading" or real schools if available).
- Redesign booking flow to include school selector.
- Update account/dashboard pages to show school context.
- Update FAQs (parents/schools tabs).
- Apply new design system (navy + teal, Montserrat + sans-serif, spacing, motion, double-bezel cards).
- QA: responsive (mobile/tablet/desktop), animations smooth, Lighthouse > 90.

**Execution:** Use house `web-builder` + `taste` + `premium-frontend` skills per builder-skills-gate requirement.

### Phase 3: Schools Model + Enquiry + Data (4-5 days)
**Deliverables:** Database schema live, school enquiry form functional, school CRUD in admin, multi-school booking logic.

**Tasks:**
- Create migrations 015-017 (schools, school_enquiries, school_id columns, backfill, indexes).
- Implement /for-schools enquiry form: collects data, validates (Zod), saves to DB, sends email to confidancejessica@gmail.com via Resend.
- Create "Grove Neighbourhood Centre" school record for legacy bookings.
- Update booking form: add school selector step (searchable dropdown), filter classes by school.
- Update /schools page: query schools from DB, show "Schools Loading" if count = 0.
- Admin: schools CRUD page (/admin/schools), enquiries inbox (/admin/enquiries).
- Backfill: assign existing classes/bookings to Grove. Verify no orphaned data.
- Test: enquiry -> email -> admin inbox -> convert to school -> school appears on /schools and booking flow.

**Execution:** Database migrations must be reversible. RLS policies for schools data. Strict TypeScript.

### Phase 4: Admin Overhaul (5-7 days)
**Deliverables:** Full visual/UX upgrade of all admin pages.

**Tasks:**
- Design admin layout (sidebar, top bar, cards, tables, forms, buttons, toasts).
- Rebuild dashboard: summary cards, upcoming classes, action items, enquiries count.
- Build /admin/schools (CRUD, form validation).
- Build /admin/enquiries (list, filter, view, update status, convert to school).
- Rebuild /admin/classes (add school filter + column).
- Rebuild /admin/bookings (add school filter + column).
- Rebuild /admin/attendance, /admin/messages, /admin/payments, /admin/settings (apply new design).
- New page /admin/reports (by-school, by-term, CSV export).
- QA: all existing features preserved (payment recovery, refunds, invoice download, reschedule, family notes, attendance tracking, CSV export, waitlist, reschedule, account delete/export).

**Execution:** Apply admin design system consistently. No feature loss.

### Phase 5: Poster Update (1-2 days)
**Deliverables:** A4 PDF with live URL + optional social version.

**Tasks:**
- Update Jessica's poster with live domain URL (https://www.confidancecommunity.co.uk).
- If creating optional social version: use house `poster-builder` skill with brand tokens, existing poster as reference.
- Jessica review/approval.
- Export: `confidance-schools-poster-a4-updated.pdf` + `confidance-schools-poster-social.png` (optional).

### Phase 6: QA & Launch (3-4 days)
**Deliverables:** Tested, deployed, live.

**Tasks:**
- **E2E testing:**
  - Parent: login -> browse schools -> select school -> select class -> book -> pay -> confirmation.
  - School enquiry: /for-schools form -> submit -> email to Jessica -> admin inbox -> status update -> convert to school -> appears on /schools.
  - Admin: view dashboard -> manage schools -> manage enquiries -> manage classes -> view bookings -> refund.
- **Regression testing:** All 18 existing features still work (reminders, waivers, capacity, attendance, refunds, invoices, reschedule, family notes, waitlist, etc.).
- **Performance:** Lighthouse > 90 (performance, a11y, best practices, SEO).
- **Visual QA:** All pages match design tokens. Hover states smooth. Responsive.
- **TypeScript:** tsc --noEmit passes (no new errors beyond baseline).
- **Tests:** vitest all green. npm run build succeeds. No unused imports.
- **Commits:** Conventional (feat:, fix:, refactor:, etc.).
- **Deploy:** Push origin -> GitHub Actions CI -> Vercel auto-deploy (prod). Site live.

**Timeline:** Sequential (each phase depends on previous). Estimated total: 5-6 weeks.

---

## I. RISKS & OPEN QUESTIONS

### 1. Capacity Setting Mismatch
**Risk:** Partnership Pack says "Up to 15 children per class", but app currently has MAX_BOOKINGS_PER_CLASS = 12.

**Action needed:** Confirm with Jessica whether classes should cap at 15 or stay at 12. Update code and curriculum accordingly.

### 2. Parent Booking Flow Complexity
**Risk:** Adding school selection adds a step. Parents may drop off.

**Mitigation:** Design school selector as intuitive dropdown with school names/locations. A/B test if desired.

### 3. First School Sign-Up Timing
**Risk:** "Schools Loading" placeholder may appear stale if no schools sign up quickly.

**Mitigation:** Have a plan for acquiring the first school. Fallback: feature Grove as a "first partner" location if no other schools sign up within a set timeframe.

### 4. Poster Printing & QR Codes
**Risk:** Once printed, QR code is static. If /for-schools URL changes, printed posters become outdated.

**Mitigation:** Use stable URL that doesn't move (e.g., short redirect) or ensure /for-schools is permanent.

### 5. Admin Permissions & Multi-User
**Risk:** Currently, admin is single user (Jessica/Chris). Multi-school model may require per-school admins (future).

**Mitigation:** For MVP, keep single admin. Note in code for future RLS scoping per school.

### 6. Email Delivery & Resend
**Risk:** School enquiries must reliably email Jessica at confidancejessica@gmail.com.

**Mitigation:** Ensure Resend is configured, test email sending in staging, monitor delivery.

---

## J. "EVERY CHANGE" CHECKLIST

### Brand Tokens
- [ ] Fonts: Montserrat (headings, uppercase, letter-spaced), clean sans-serif (body/UI), script (accents, pull-quotes).
- [ ] Wordmark: "CONFIDANCE" two-tone (navy "CONFI" + teal "DANCE").
- [ ] Primary navy: #173B4C (headers, footer, text, "CONFI").
- [ ] Teal accent: #2E8FA3 ("DANCE", icons, links, buttons, badges).
- [ ] Pale blue: #DCEBF0 (section washes, badge backgrounds, soft accents).
- [ ] White/light backgrounds.
- [ ] Charcoal text (no pure black).
- [ ] Semantic status colours: green #4CAF50, red #EF4444, amber #F59E0B, blue #3B82F6.
- [ ] Border radius: 12px cards, 8px inputs, 4px small elements.
- [ ] Shadows: xs/sm/md/lg layered, no drop shadows > md.
- [ ] Double-bezel cards: white with thin teal border inside pale-blue wash.
- [ ] Spacing scale: py-24+ sections, px-6/8/12 responsive, 20-24px card padding.
- [ ] Motion tokens: easeOut (0.16, 1, 0.3, 1), easeSpring (0.34, 1.56, 0.64, 1), 400-600ms.
- [ ] "INSPIRE. EMPOWER. SHINE." badge motif on hero, postcards, social.
- [ ] Update globals.css with navy/teal custom properties.
- [ ] Update Tailwind theme config.

### Homepage (`/`)
- [ ] Hero: left-aligned headline + right-side image/visual.
- [ ] Headline: "Build Confidence. Discover Your Stage."
- [ ] Tagline: "Building confidence through performing arts."
- [ ] Subheading: "Professional performing arts clubs in partner schools."
- [ ] Trust badges: "Musical Theatre Performer", "First Class Honours Graduate", "Enhanced DBS", "Schools Partner".
- [ ] CTAs: Primary "Register Your School" (/for-schools), Secondary "Browse Clubs" (/schools).
- [ ] Remove bubbles; add spotlight/stage motif.
- [ ] Update marquee: "Professional performer", "School partnerships", etc.
- [ ] Featured Schools carousel (empty state).
- [ ] Update copy per Partnership Pack.
- [ ] Update meta title/description (SEO).

### For Schools Page (`/for-schools`) — NEW
- [ ] Hero: "Professional Performing Arts Clubs for Your School", "Register Your School" CTA.
- [ ] Welcome / Why Performing Arts section (benefits: Confidence, Communication, etc.).
- [ ] About Jessica excerpt (bio, photo, link to /about-jessica).
- [ ] Our After-School Clubs section (KS1, KS2, 1-hour weekly, inclusive, optional performances, up to 15 children, free taster).
- [ ] What Does a Session Look Like? (7-step timeline from Partnership Pack).
- [ ] Why Partner With Confidance? (4-5 double-bezel cards: curriculum, performer, we-handle-everything, support-pshe, flexibility).
- [ ] Safeguarding & Professional Standards section (DBS, insurance, training, policies).
- [ ] FAQs for schools (6-8 questions from Partnership Pack).
- [ ] Enquiry form: school name, type, contact details, estimated students, preferred days/times, notes. Validation + submit + thank-you message.
- [ ] Form submission: save to school_enquiries table, email to confidancejessica@gmail.com via Resend.
- [ ] Double-bezel cards, teal accents, Montserrat headings, generous padding.

### About Jessica Page (`/about-jessica`) — NEW
- [ ] Split layout: left image (headshot + action photo), right bio + credentials.
- [ ] Bio: "Hi, I'm Jess! Musical Theatre Performer and Children's Performing Arts Teacher..." (from Partnership Pack).
- [ ] Credentials: training, degree, certifications, DBS, insurance, years experience, students taught.
- [ ] Philosophy: confidence-building approach, why she loves working with children.
- [ ] Media: embed existing video (if available on live site) or link. No new video needed.
- [ ] Testimonials: link or embed existing parent/school quotes (if available). Placeholder otherwise.
- [ ] Social links: LinkedIn, performance videos, etc. (if applicable).
- [ ] Premium design: Montserrat headings, clean sans body, minimal.

### Schools Discovery Page (`/schools`)
- [ ] When no schools: "Schools Loading" placeholder (icon, heading, body, "Register Your School" CTA).
- [ ] When schools exist: list as cards/rows (name, address, photo, club count, "View Clubs" button).
- [ ] Click school to expand: show classes (type, day, time, price, capacity, "Book Now" button).
- [ ] Copy: "Find a club at your child's school."
- [ ] Empty state per school: "No active clubs yet. Contact us."

### Booking Flow (`/book`)
- [ ] Add school selector as first step (searchable dropdown or radio list).
- [ ] Label: "Select the school where your child attends."
- [ ] Require login before school selection (auto-fill child age from profile).
- [ ] Dynamically filter classes by selected school.
- [ ] Preserve all downstream: child details -> term -> ticket type -> payment.
- [ ] Update success page: show school prominently.
- [ ] If no schools exist: "Schools Loading" state with helpful message.

### Account / Dashboard (`/account`, `/dashboard`)
- [ ] Add "School" column or badge to class/booking displays.
- [ ] Format: "Class Name at [School Name]".
- [ ] Add "View School" link to `/schools/[school-id]`.
- [ ] If multi-school child: show all clubs across schools.
- [ ] Preserve all existing: payment history, invoices, attendance, reschedule, refund, family notes.

### FAQs (`/faqs`)
- [ ] Add toggle/tab: "For Parents" vs. "For Schools".
- [ ] For Parents: existing Qs + new Qs (class differences, school availability, waitlists, progress).
- [ ] For Schools: 6-8 questions from Partnership Pack (room needs, class size, billing, taster, etc.).

### Privacy Policy (`/privacy`)
- [ ] Replace "Grove Neighbourhood Centre" with "partner schools".
- [ ] Add: "We collect information about which schools your child's clubs are hosted at, for administrative and billing purposes."

### Terms of Service (`/terms`)
- [ ] Consistency with privacy policy. Minimal updates.

### Database Schema
- [ ] Create `schools` table (id, name, address, postcode, area, contact_name, contact_email, contact_phone, setup_date, active, notes, logo_url, school_type, capacity_notes, created_at).
- [ ] Create `school_enquiries` table (id, created_at, school_name, school_type, contact_name, contact_email, contact_phone, estimated_students, preferred_days_times, notes, status, admin_notes, assigned_to, updated_at).
- [ ] Add `school_id` to `classes` (UUID FK, nullable initially; backfill to Grove; add NOT NULL post-migration).
- [ ] Add `school_id` to `bookings` (UUID FK, nullable initially; backfill from classes; add NOT NULL post-migration).
- [ ] Create indexes: schools(active), school_enquiries(status, created_at), classes(school_id), bookings(school_id).
- [ ] Create "Grove Neighbourhood Centre" school record.
- [ ] RLS policies: active schools readable by public; school data read/write by admin only.

### Admin Dashboard (`/admin`)
- [ ] Rebuild layout: sidebar (navy #173B4C), top bar, main content.
- [ ] Apply new design system: double-bezel cards, teal accents, Montserrat + sans-serif.
- [ ] Summary cards: schools (X active, Y pending), classes (X running, Y spaces, Z waitlist), revenue, action items.
- [ ] Upcoming sessions: next 5 classes across all schools.
- [ ] School enquiries count: link to /admin/enquiries.

### Schools Management (`/admin/schools`) — NEW
- [ ] CRUD page: list schools, "Add School" button, edit/delete actions.
- [ ] Columns: name, location, active status, contact, # classes, # bookings, actions.
- [ ] Edit form: name, address, postcode, area, contact details, logo upload, school type, capacity notes, active toggle, internal notes.

### School Enquiries Inbox (`/admin/enquiries`) — NEW
- [ ] List: school name, contact person, date, status, actions.
- [ ] Filter by status (new/contacted/interested/signed/rejected).
- [ ] Click enquiry: view details, status dropdown, admin notes, "Assign to" dropdown, "Send Email" CTA, "Create School Record" button.
- [ ] Once signed: convert to school record (linked to enquiry).
- [ ] Empty state: "No enquiries yet."

### Admin Classes (`/admin/classes`)
- [ ] Add "School" column and filter dropdown.
- [ ] Add school selector to create/edit form.
- [ ] Classes scoped by school.
- [ ] Apply new admin design system.

### Admin Bookings (`/admin/bookings`)
- [ ] Add "School" column and filter dropdown.
- [ ] Preserve all existing: reschedule, cancel, refund, payment status.
- [ ] Apply new admin design system.

### Admin Attendance (`/admin/attendance`)
- [ ] Add "School" column and filter dropdown.
- [ ] Apply new admin design system.

### Admin Messages (`/admin/messages`)
- [ ] Add "School" filter.
- [ ] Add "Sent via" column.
- [ ] Apply new admin design system.

### Admin Payments (`/admin/payments`)
- [ ] Add "School" column and filter dropdown.
- [ ] Preserve refund/recovery logic.
- [ ] Apply new admin design system.

### Admin Reports (`/admin/reports`) — NEW
- [ ] By-school table: school name, # active children, # bookings, revenue, attendance rate.
- [ ] By-term summary: total revenue, students, attendance rate, cancellations/refunds.
- [ ] Export CSV (filtered by school/term).

### Admin Settings (`/admin/settings`)
- [ ] Add "Default School" setting (legacy; initially Grove).
- [ ] Preserve existing: pricing, sibling discount %, max bookings, SMTP/Resend config.

### Poster
- [ ] Update A4 poster with live URL (https://www.confidancecommunity.co.uk).
- [ ] Optional: Create social version (1080x1350px) using poster-builder skill.
- [ ] Deliverables: `confidance-schools-poster-a4-updated.pdf`, `confidance-schools-poster-social.png` (optional).

### Code Quality
- [ ] TypeScript strict mode, no new `any`.
- [ ] Zero unused imports.
- [ ] New API routes: Zod validation.
- [ ] Supabase RLS: schools + enquiries tables.
- [ ] Vitest all green.
- [ ] npm run build passes.
- [ ] tsc --noEmit passes (baseline errors only).
- [ ] Conventional commits (feat:, fix:, refactor:, etc.).
- [ ] No console.log in production code.
- [ ] Lighthouse > 90.
- [ ] Responsive (320px-2560px).
- [ ] E2E tests: parent booking, school enquiry, admin workflows.

### Deployment
- [ ] Push to origin/main.
- [ ] GitHub Actions CI passes.
- [ ] Vercel auto-deploy to production.
- [ ] Site live at https://www.confidancecommunity.co.uk.

---

## Technical Implementation Notes

### API Routes (New/Changed)

**POST /api/enquiries**
- Endpoint: /for-schools form submission.
- Request: school_name, school_type, contact_name, contact_email, contact_phone, estimated_students, preferred_days_times, notes.
- Validation: Zod (email, school name required).
- Response: 201 with enquiry id, or 400 validation errors.
- Side effect: email to confidancejessica@gmail.com via Resend.

**GET /api/schools**
- Returns schools (active=true for public, all for admin).
- Query: ?active=true, ?admin=true (auth required).

**POST /api/schools**
- Create school (admin auth required).
- Request: name, address, postcode, area, contact_name, contact_email, contact_phone, school_type, capacity_notes, active.
- Validation: Zod.
- Response: 201 with school object.

**GET/PATCH /api/schools/:id**
- Get/update school (admin auth).

**GET /api/enquiries**
- List enquiries (admin auth).
- Query: ?status=new, ?sort=created_at.

**PATCH /api/enquiries/:id**
- Update status, admin_notes, assigned_to (admin auth).

### Migrations (Starting at 015)

**Migration 015: Create schools and school_enquiries tables**
```sql
-- up
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  area TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  setup_date TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT FALSE,
  notes TEXT,
  logo_url TEXT,
  school_type TEXT CHECK (school_type IN ('primary', 'secondary', 'other')),
  capacity_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE school_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  school_name TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('primary', 'secondary', 'other')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  estimated_students INTEGER,
  preferred_days_times TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'signed', 'rejected')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX schools_active_idx ON schools(active);
CREATE INDEX enquiries_status_idx ON school_enquiries(status);
CREATE INDEX enquiries_created_idx ON school_enquiries(created_at DESC);

-- down
DROP TABLE school_enquiries;
DROP TABLE schools;
```

**Migration 016: Add school_id to classes**
```sql
-- up
ALTER TABLE classes ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE RESTRICT;

INSERT INTO schools (name, address, postcode, active, setup_date) 
VALUES ('Grove Neighbourhood Centre', '7 Bradmore Park Road, Hammersmith, W6 0DT', 'W6 0DT', TRUE, NOW())
ON CONFLICT DO NOTHING;

UPDATE classes SET school_id = (SELECT id FROM schools WHERE name = 'Grove Neighbourhood Centre' LIMIT 1)
WHERE school_id IS NULL;

CREATE INDEX classes_school_id_idx ON classes(school_id);

-- down
DROP INDEX classes_school_id_idx;
ALTER TABLE classes DROP COLUMN school_id;
DELETE FROM schools WHERE name = 'Grove Neighbourhood Centre';
```

**Migration 017: Add school_id to bookings**
```sql
-- up
ALTER TABLE bookings ADD COLUMN school_id UUID REFERENCES schools(id);

UPDATE bookings 
SET school_id = (SELECT school_id FROM classes WHERE classes.id = bookings.class_id)
WHERE school_id IS NULL;

CREATE INDEX bookings_school_id_idx ON bookings(school_id);

-- down
DROP INDEX bookings_school_id_idx;
ALTER TABLE bookings DROP COLUMN school_id;
```

---

This plan is comprehensive, technically grounded, and execution-ready. All pages are defined, data model is explicit, migrations are drafted, and the "every change" checklist ensures nothing is missed during build.
