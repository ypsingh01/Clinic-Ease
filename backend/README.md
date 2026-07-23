# ClinicEase Backend

Express + Prisma + Socket.io API.

**Free deploy:** Render + Neon with `FREE_TIER=true` — see [`../DEPLOY.md`](../DEPLOY.md) and [`../render.yaml`](../render.yaml).

**Paid production:** unset `FREE_TIER` and supply live Razorpay / Twilio / reCAPTCHA (see `.env.example`).

## Database

Postgres only. Set `DATABASE_URL` to Neon (or any Postgres).

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
SEED_DEMO_USERS=true npm run db:seed
npm run dev
```

Health (DB ping): `GET /api/health` → `{ ok, db: "up" }`

### Demo logins (when `SEED_DEMO_USERS=true`)

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@clinicease.app | demo1234 |
| Doctor | doctor@clinicease.app | demo1234 |
| Admin | admin@clinicease.app | demo1234 |

Free-tier / local OTP: `OTP_DEV_CODE` (e.g. `123456`).

## Key routes

- `/api/auth/*`, `/api/doctors/*`, `/api/slots/:doctorId`
- `/api/appointments/*`, `/api/payments/order|confirm|confirm-mock|webhook`
- `/api/queue/*`, `/api/waitlist/*`, `/api/admin/*`

Socket.io: JWT required on connect.
