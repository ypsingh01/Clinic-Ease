# ClinicEase

Single-clinic, multi-doctor appointment platform (Patient / Doctor / Admin).

| App | Path | Free-tier host |
|-----|------|----------------|
| Frontend | [`frontend/`](frontend/) | **Vercel Hobby** |
| Backend | [`backend/`](backend/) | **Render Free** |
| Database | Neon Postgres | **Neon Free** |

## Deploy ($0)

Follow **[`DEPLOY.md`](DEPLOY.md)** — Neon → Render (`FREE_TIER=true`) → Vercel.

```bash
# Optional: build API image locally
cd backend && docker build -t clinicease-api .
cd frontend && npm ci && npm run build
```

CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Local development

Needs a Postgres `DATABASE_URL` (Neon free branch works).

```bash
cd backend
cp .env.example .env   # FREE_TIER / ALLOW_MOCK_PAY / OTP_DEV_CODE for easy local
npm install
npx prisma migrate deploy
SEED_DEMO_USERS=true npm run db:seed
npm run dev

cd frontend
cp .env.example .env
npm install && npm run dev
```

## Docs

- Deploy (free + paid): [`DEPLOY.md`](DEPLOY.md)
- Backend: [`backend/README.md`](backend/README.md)
- QA: [`frontend/FULLSTACK_QA.md`](frontend/FULLSTACK_QA.md)
