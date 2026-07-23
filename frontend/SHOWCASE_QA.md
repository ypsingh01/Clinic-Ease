# ClinicEase Showcase QA (Phase 9)

Production-minded checklist for the frontend mock product. Re-run before demos.

## Performance

- [x] Route-level `React.lazy` + `Suspense` with splash fallback
- [x] Manual chunks: `react`, `motion`, `charts`, `icons`
- [x] Landing + login stay eager for first paint
- [ ] Lighthouse mobile pass on deployed host (after Phase 8 hosting)

## Accessibility

- [x] Skip link to `#main-content`
- [x] `.sr-only` utility + live queue announcer (`QueueLiveAnnouncer`)
- [x] Portal nav announces current page
- [x] Focus rings via design tokens; 44px targets on controls
- [x] Status never color-only (`StatusPill` + labels)
- [x] `prefers-reduced-motion` zeros durations / splash pulse
- [ ] Full screen-reader walkthrough on VoiceOver/NVDA (manual)

## Responsive & density

- [x] Patient shell mobile drawer; doctor/admin dense sidebar
- [x] Landing sticky nav + mobile menu
- [x] Schedule grid / tables scroll horizontally on small screens
- [x] No bare empty voids — placeholders and empty states are designed

## Resilience

- [x] Error boundary with calm recovery CTAs
- [x] Scroll-to-top on route change
- [x] Mock data persistence in `localStorage` (patient / doctor / admin / auth)

## Role demo paths

1. `/` — marketing landing  
2. `/login` → **patient** — book flow → appointments → waitlist  
3. `/login` → **doctor** — complete token → running late  
4. `/login` → **admin** — schedule grid → walk-in → broadcast  
5. `/dev/ui` — component library  

## Out of Phase 9

- Real API / Socket.io / Razorpay (Phase 8 — needs backend)
- FR7 deep prescriptions (v2)
- Deployment / SSL (SDLC deferred)
