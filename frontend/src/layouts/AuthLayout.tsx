import { Outlet, Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { SkipLink } from '@/a11y'

export function AuthLayout() {
  return (
    <>
      <SkipLink />
      <div className="bg-bg grid min-h-dvh lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(15,110,86,0.18), transparent), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(216,90,48,0.12), transparent), #0F6E56',
            }}
          />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
              <span className="bg-surface/15 text-surface flex size-10 items-center justify-center rounded-[12px] backdrop-blur">
                <span className="font-display text-xl font-semibold">+</span>
              </span>
              <span className="font-display text-surface text-lg font-semibold">ClinicEase</span>
            </Link>
          </div>
          <div className="relative max-w-md">
            <p className="text-primary-light text-sm font-medium tracking-wide">
              Your care, simplified
            </p>
            <h1 className="font-display text-surface mt-3 text-3xl leading-tight font-medium">
              Calm booking. Live tokens. Fewer phone calls.
            </h1>
            <p className="text-surface/75 mt-4 text-[15px] leading-relaxed">
              Hourly capacity blocks, transparent queues, and WhatsApp updates — built for a
              single clinic with 5–6 doctors.
            </p>
          </div>
          <p className="text-surface/50 relative text-xs">Demo auth · mock JWT · Phase 3</p>
        </aside>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 lg:hidden">
            <Logo />
            <Link to="/" className="text-primary text-sm font-medium no-underline">
              Home
            </Link>
          </div>
          <main
            id="main-content"
            className="flex flex-1 items-center justify-center px-5 py-10 md:px-10"
          >
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
