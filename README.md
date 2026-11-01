# Taldan T.D. Engineering & Construction

B2B website for טלדן ט.ד. הנדסה ובניין (taldan.co.il). Next.js 14 App Router, Supabase (schema `taldan_site`, accessed only through RPCs), deployed on Vercel.

Environment variables (Vercel, never committed):

- `TALDAN_ADMIN_SECRET`: server-side secret presented to the dashboard RPCs and used to sign the preview-gate cookie.
- `TALDAN_DASHBOARD_PASSWORD`: what the owner types into `/dashboard`.

There are deliberately no fallback values: when a variable is missing the dashboard and the gate refuse to work.
