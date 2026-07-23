# ClinicEase Frontend

React + Vite + TypeScript SPA — design-system-first, showcase-quality clinic product UI.

## Design first

Read **[DESIGN.md](./DESIGN.md)** before adding screens. Use `src/components/ui` only.  
QA checklist: **[SHOWCASE_QA.md](./SHOWCASE_QA.md)**.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Demo

| Path | Role |
|------|------|
| http://localhost:5173/ | Marketing landing |
| /login → patient / doctor / admin | One-click demo roles |
| /dev/ui | Component library |

## Stack

- React 19 + Vite + TypeScript + Tailwind 4
- Framer Motion, Tabler Icons, Recharts
- Mock JWT + role portals (patient / doctor / admin)
- Lazy routes + code-split vendor chunks (Phase 9)

## Phase status

Phases 0–7 complete (design → library → auth → landing → patient → doctor → admin).  
Phase 8 (live API) awaits backend. Phase 9 showcase QA applied on mocks.
