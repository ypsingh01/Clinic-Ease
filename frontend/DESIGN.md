# ClinicEase Design Language — Next Level

> Award-caliber digital health craft (2026). Teal + coral DNA kept.  
> References: Hims & Hers motion · Tia editorial calm · Parsley serif trust · Good Life Meds transitions · Linear/Cal.com restraint.

---

## 1. Brand essence

**ClinicEase** — *Your care, simplified.*

Memorable in under 3 seconds. Warm, human, flowful — never hospital-blue, never purple SaaS.

| Role | Metaphor | Feeling |
|------|----------|---------|
| Patient | Guided conversation | One clear next step |
| Doctor | Fast calm tool | Low-friction actions |
| Admin | Spacious clarity | Overview without clutter |

---

## 2. Color

| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` | `#0F6E56` | Brand, links, secondary chrome |
| `--color-primary-deep` | `#0A4A3A` | Marketing ink strips / heroes |
| `--color-accent` | `#D85A30` | **One** primary CTA per view |
| `--color-bg` | `#FAF8F4` | Paper page |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-text` | `#1A1A18` | Ink |
| `--color-care` | `#E8F6F1` | Live queue / hold care panels |

Layered teal mist + coral bloom on page bg. Status = tint + label (+ icon).

---

## 3. Typography

| Role | Family | Notes |
|------|--------|-------|
| Marketing display | **Fraunces** | Landing H1 only |
| Product headings | **Nunito** 500–600 | App titles |
| Body | **Inter** 400–500 | UI, forms |
| Mono | JetBrains Mono | Tokens, timers |

Scale: ~40 / 28 / 20 / 16 / 14 / 13. Sentence case. Line-height body 1.6.

---

## 4. Shape & elevation

- Controls 12px · Cards 20px · Large 24px · Pills full.
- `--shadow-soft` cards · `--shadow-lift` interactive hover · `--shadow-modal` overlays.
- Prefer hairline borders; frosted sticky headers (`backdrop-filter`).

---

## 5. Motion (Framer only)

| Variant | Use |
|---------|-----|
| `pageEnter` / `fadeUp` | Routes & sections |
| `reveal` | Marketing panels |
| `flowStep` | Booking steps |
| `livePulse` | Token / ETA |
| `pressable` | Buttons |
| `stagger*` | Lists ≤300ms total |

`prefers-reduced-motion` → opacity / instant.

---

## 6. Layout

- **Patient mobile:** bottom tabs (Home, Book, Visits, Care, You) + overflow “More”.
- **Patient desktop:** soft top bar + optional slim side rail.
- **Doctor/Admin:** light sidebar, large canvas.
- **Booking:** conversational column, sticky progress, one group per mobile viewport.

---

## 7. Quality gate

1. Tokens only — no stray hex  
2. Loading / empty / error / success  
3. Mobile + desktop intentional  
4. Signature motion on primary flows  
5. Focus + reduced-motion  
6. One coral CTA · one next step visible  

---

*Implemented in `tokens.css`, `motion/variants.ts`, `components/ui`, layouts.*
