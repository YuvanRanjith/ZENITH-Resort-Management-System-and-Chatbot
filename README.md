# Zenith implementation and recovery

The chat workspace was empty. Existing source was recovered from `C:\Users\yuvan\OneDrive\Desktop\VS code\project` into this directory. The original was not edited. Existing components, styling, types, and migrations 001–006 were retained. No credentials or node_modules were copied. Git history was not available for comparing earlier changes.

## Inspection

Completed before recovery: visual design tokens, navigation/footer, UI primitives, domain types, Supabase client/auth context, tables, RLS policies, room sample seed, exclusion constraint for booking overlap, privileged helper functions.

Incomplete before recovery: App.tsx placeholder; routes, public pages, booking queries, customer dashboard, manager views, export implementation. Security issues found: customer reservation writes trusted caller amounts/status, employees could update their own privilege fields and view salaries, anonymous first-manager setup, and dashboard balances double-counted totals when bookings had multiple payments.

## Run

Use Node 22.12+ (verified here with Node 26.4.0).

1. `npm ci`
2. Copy `.env.example` to `.env` and supply `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply migrations in filename order to a Supabase project. For an existing installation, apply only missing migrations; migration 007 is additive and revokes insecure legacy grants. Do not re-seed an existing database.
4. `npm run dev` (or `npm run build` and `npm run preview`). Configure production hosting to serve index.html for client routes.

The application displays a setup notice and disables database actions when environment variables are absent. It does not substitute fake availability or records. The original room seed contains academic sample rooms.

## First manager and employee creation

Run `node scripts/bootstrap-manager.mjs` from a trusted operator shell with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ZENITH_MANAGER_EMAIL`, `ZENITH_MANAGER_PASSWORD` (12+ characters), and `ZENITH_MANAGER_NAME` set. Never prefix the service key with VITE_ or place it in frontend files. This uses the supported Auth admin API and refuses when a manager already exists. Run first-manager provisioning once, with a single operator. Clear provisioning variables afterward.

Deploy `supabase/functions/admin-staff` with JWT verification enabled using the Supabase CLI. Set the function secret `APP_ORIGIN` to the exact frontend origin, e.g. `http://localhost:5173`. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are supplied by Supabase to Edge Functions. The function verifies the token against Auth and checks the current server-side manager role before creating an Auth identity and employee record. It attempts Auth cleanup on a record insertion failure; if cleanup fails, it logs the orphan user ID for an operator to investigate. Legacy SQL auth-user creation and anonymous bootstrap are disabled by migration 007.

## Implemented in this pass

- Public routes, responsive existing navigation/footer, homepage, room catalogue, login/register, about/contact, not-found page, protected customer/staff/manager routes.
- Persistent availability by dates, capacity, category, active reservation overlap and maintenance status. Periodic and focus refresh. Booking locks the room, calculates 3% tax on the server, and retains the existing GiST exclusion constraint for concurrent overlap protection. Direct authenticated reservation writes are revoked. Customer cancellation is restricted to their own pending/confirmed bookings.
- Customer reservation and billing record view, with room and payment data.
- Manager overview using persisted counts/payment aggregates; customer, employee, room and reservation tables with search/filter; permitted customer/staff edits; room add/update; employee creation through the Edge Function.
- Manager-only CSV RPC with explicit allowlisted columns, UTF-8 BOM download, quotes/newline escaping, spreadsheet formula neutralization including leading whitespace/control characters, date filenames, customer status/staff department filters, and atomic export audit insertion. No credentials or identity proof exported. Export buttons share a filter: clear or select the filter appropriate to the export kind.
- Staff salary restriction, prevention of direct employee privilege updates, safer session loading without database queries inside Auth callbacks.

## Checks and limitations

Dependency install, TypeScript, lint, production build, and CSV download unit check were executed; see IMPLEMENTATION-CHECKS.md for final outcomes. No automated test script existed in the recovered package. Added `node --test tests/csv.test.mjs`.

No database environment file was present in the recovered project; no database was connected or changed. Supabase CLI/PostgreSQL CLI were unavailable. Migration execution, real login, concurrent reservation tests, server-side non-manager denial, actual record export/audit insertion, and Edge Function provisioning still require a configured Supabase instance. TypeScript/build do not validate SQL or Deno Edge Function deployment. Database behavior described above is implemented but must be integration-tested before production.

Remaining master-prompt work: customer profile editing, downloadable invoices, date modification requests, staff contact/service workflows, check-out UI, employee department reassignment, richer role-specific staff task screens, and payment-entry workflows. The current staff dashboard identifies the role and links to availability; it is not a complete operations console. Contact details and room seeds are clearly labeled demonstration content. Mobile CSS is responsive, but device-size verification remains pending.

## Changed files

Modified recovered files: src/App.tsx, src/context/AuthContext.tsx, src/lib/supabase.ts, src/components/public/Navbar.tsx (homepage contrast), package.json (test script).

Created: src/lib/csv.ts, src/components/ManagerEditor.tsx, src/components/StaffCreate.tsx, supabase/migrations/20261025160000_007_booking_exports_security.sql, supabase/functions/admin-staff/index.ts, scripts/bootstrap-manager.mjs, tests/csv.test.mjs, .env.example, .gitignore, README.md, IMPLEMENTATION-CHECKS.md. Other source files were preserved from recovery.



## Email confirmation redirects

In Supabase Authentication > URL Configuration, set Site URL to the exact origin serving Zenith (including port during local development). Add that origin followed by /login to Redirect URLs. Signup now sends emailRedirectTo based on the current browser origin. Keep the development server running, and open local confirmation links on the same computer. Previously sent emails retain their old redirect target. If the confirmation succeeded before the redirect failed, signing in directly may already work; otherwise use a fresh confirmation email after correcting URL Configuration. Do not disable email confirmation to work around a redirect issue.

## Customer booking chatbot

Open `/customer/assistant` or use “Chat to book a room” on the customer dashboard. The assistant guides guests through dates, guest count, category, live room choices, price review, and explicit confirmation. Reservations use the existing available_rooms and book_room RPCs, including server tax calculation, maintenance checks and transactional overlap enforcement. Success links to the existing reservation history. Staff accounts cannot book through the assistant. This is a guided conversational chatbot, not a generative AI integration; it needs no additional API key, database table, or migration. Free-text inputs support ISO dates, guest counts, exact room category names, “any”, “help”, and “restart”. Chat history stays in component memory and is cleared on leaving the page. No email, password or payment details are requested in chat.
