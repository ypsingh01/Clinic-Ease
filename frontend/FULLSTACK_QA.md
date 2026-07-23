# ClinicEase — Full-stack QA checklist

## Prerequisites

1. Backend: `cd backend && npm run db:seed && npm run dev` (SQLite `file:./dev.db`; Postgres via `docker-compose` when available)
2. Frontend: `cd frontend && npm run dev` (`.env` has `VITE_USE_MOCK_CLINIC=false`)
3. Automated: `cd backend && npx tsx scripts/qa-run.ts` (run last: rate-limit test; restart API afterward for UI login)

## Auth (FS1)

- [x] Login patient/doctor/admin with captcha stub checked
- [x] Phone OTP path (code `123456`)
- [x] Patient cannot call `/api/admin/stats` (403)

## Doctors & slots (FS2)

- [x] `/patient/doctors` shows photos from API
- [x] Book calendar respects available days
- [x] Hour blocks show live capacity

## Booking (FS3–FS4)

- [x] Hold → mock pay → confirm creates token
- [x] Token appears on doctor queue and admin grid
- [x] Cancel within policy; admin force-cancel works

## ETA / delay (FS3a)

- [x] Doctor “Running late” shifts ETAs
- [x] Complete visit promotes next token

## Waitlist (FS3b)

- [x] Join waitlist on full block
- [x] Claim offered entry → hold → pay

## Notifications (FS5)

- [x] Confirm creates in-app + WhatsApp mock rows
- [x] Admin broadcast delivers to audience

## Analytics (FS8)

- [x] Admin analytics doctor-performance returns punctuality/heatmap/waitlist rate

## Security (FS9)

- [x] Rate limit returns 429 after burst on `/api/auth/login`
- [x] Captcha required on register/login/hold

## UI fixes verified in this QA pass

- [x] `AuthProvider` wraps `ClinicProvider` (fixes `useAuth` crash)
- [x] Stale/mock JWT cleared on 401; demo login no longer falls back to mock tokens against live API
- [x] Notifications list includes WhatsApp channel rows
