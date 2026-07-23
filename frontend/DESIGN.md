# ClinicEase Design Language

> Lock document for Plan C Phase 0. All UI must follow this system.  
> Brand sources: `frontend design.pdf` + Requirement Analysis FRs.  
> Craft bar: Linear density · Vercel calm · Apple clarity — adapted to warm clinic trust.

---

## 1. Brand essence

**ClinicEase** — *Your care, simplified.*

Warm, trustworthy, unhurried. Not hospital-blue corporate. Not marketplace clutter.  
Patients feel guided; clinicians feel in command; admins feel operational clarity.

### Experience metaphors

| Role | Metaphor | Feeling |
|------|----------|---------|
| Patient | Guided care journey | Reassuring, clear next step |
| Doctor | Live clinic command | Fast, calm under pressure |
| Admin | Operations cockpit | Dense, decisive, overview-first |

---

## 2. Color tokens

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-primary` | `#0F6E56` | Brand, headers, links, secondary actions |
| `--color-primary-light` | `#5DCAA5` | Accents, progress, success chrome |
| `--color-primary-tint` | `#E1F5EE` | Info surfaces, soft highlights |
| `--color-accent` | `#D85A30` | **Only** primary CTAs (one per view) |
| `--color-accent-tint` | `#FAECE7` | Coral soft backgrounds |
| `--color-bg` | `#FDFBF7` | Page background — never pure `#FFFFFF` as page |
| `--color-surface` | `#FFFFFF` | Cards / elevated panels on warm bg |
| `--color-text` | `#2C2C2A` | Primary text |
| `--color-text-secondary` | `#5F5E5A` | Secondary |
| `--color-text-muted` | `#888780` | Captions, hints |
| `--color-border` | `#D3D1C7` | Hairlines, dividers |
| `--color-success` | `#0F6E56` on `#E1F5EE` | Status (always + label) |
| `--color-warning` | `#9A6700` on `#FFF3CD` | Status |
| `--color-danger` | `#B42318` on `#FEE4E2` | Status / destructive |

**Rules**
- One coral primary CTA per screen.
- Teal = secondary / brand chrome.
- Ghost = tertiary.
- Status never by color alone — tint + dark text + label.

---

## 3. Typography

| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| Display / headings | Nunito | 500–600 | Never 700 spam; sentence case |
| Body / UI | DM Sans | 400–500 | Forms, buttons, tables |
| Mono (rare) | JetBrains Mono | 400 | Tokens, IDs, timers |

### Scale (rem @ 16px root)

| Step | Size | Line | Use |
|------|------|------|-----|
| display | 2rem / 32px | 1.2 | Landing hero only |
| h1 | 1.625rem / 26px | 1.25 | Page titles |
| h2 | 1.25rem / 20px | 1.3 | Section titles |
| h3 | 1.125rem / 18px | 1.35 | Card titles |
| body | 1rem / 16px | 1.5 | Default |
| sm | 0.875rem / 14px | 1.45 | Secondary |
| caption | 0.75rem / 12px | 1.4 | Floor — never smaller |

---

## 4. Spacing & layout

- **Grid:** 8px base (`--space-1` = 4px, `--space-2` = 8px, …).
- **Page gutters:** 24px mobile, 32px desktop.
- **Content max:** 1200px (patient / marketing); doctor/admin may go fluid with sidebar.
- **Section rhythm (landing):** 64–96px vertical.
- **Card padding:** 16–24px.
- **Control height:** min **44px** tap target.
- **Radius:** controls 10px, cards 12–16px, pills 9999 for status only when label present.
- **Shadow:** modal only `0 4px 16px rgba(0,0,0,0.08)` — flat UI elsewhere; prefer border + tint.

### Density

Fill the viewport with **hierarchy** (status strip → primary canvas → secondary rail).  
Never large empty voids. Never card soup. One job per section.

---

## 5. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Most UI |
| `--ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--duration-fast` | 120ms | Hover, press |
| `--duration-normal` | 200ms | Panels, fades |
| `--duration-slow` | 320ms | Page enter, drawers |
| Splash pulse | ~1.8s | Logo loader |

**Patterns:** page fade-up, list stagger (40ms), button scale 0.98 on press, drawer spring, queue soft pulse, hold-timer urgency.

**Hard rule:** honor `prefers-reduced-motion: reduce` — instant state, no loops.

---

## 6. Elevation & surfaces

1. Page: warm `#FDFBF7` + subtle radial teal wash (low opacity).
2. Surface: white card, 1px `--color-border`, radius 12–16.
3. Tint panels: primary/accent tints for callouts — not gray boxes.
4. Interactive card: border deepens / translateY(-1px) on hover — no heavy shadow stacks.

---

## 7. Iconography

- Outline icons only — **Tabler Icons**.
- Sizes: 16 / 20 / 24.
- Align optically with text; 1.5 stroke feel.
- No emoji as UI decoration.

---

## 8. Component principles

- Every control is designed — **no native browser look** (inputs, selects, checkboxes restyled).
- Loading / empty / error / success for every data view.
- Tables live **inside** cockpits — never a bare CRUD page.
- Anti-CRUD: gallery, timeline, queue canvas, KPI band + ledger, preference panels.

---

## 9. Accessibility

- Contrast AA+ for text on surfaces.
- Visible **2px teal** focus ring (`--color-primary`).
- Labels above inputs; errors announced.
- Status = color + text.
- Live regions for token / ETA updates.
- Keyboard paths for booking steps and queue actions.
- Skip link to main content.

---

## 10. Product UX copy (from requirements)

- Capacity: “X of N spots remaining”
- ETA: estimate / window language — never a guarantee
- Live: “Currently serving token #N”
- Symptom helper: guidance disclaimer, not diagnosis
- Buttons: verb-first (“Book appointment”, “Confirm & pay”)
- Errors: calm, actionable

---

## 11. Quality gate (every screen)

1. Uses tokens / library only — no one-off hex or fonts  
2. Loading, empty, error, success designed  
3. Mobile + desktop intentional  
4. ≥2–3 purposeful motions on primary flows  
5. Focus + reduced-motion checked  
6. Feels connected to adjacent screens  

---

## 12. Do / Don’t

| Do | Don’t |
|----|--------|
| One coral CTA | Multiple competing coral buttons |
| Warm page bg | Pure white full-bleed pages |
| Sentence case | ALL CAPS labels |
| Outline icons | Filled icon noise |
| Estimate language | False precision on wait times |
| Purposeful density | Sparse empty dashboards |
| Shared chrome | One-off layouts per page |

---

*Phase 0 lock — implement in `src/styles/tokens.css` and Tailwind theme. Update this file only when brand decisions change.*
