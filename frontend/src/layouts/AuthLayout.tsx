import { Outlet, Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { SkipLink } from '@/a11y'

export function AuthLayout() {
  return (
    <>
      <SkipLink />
      <div className="bg-bg grid min-h-dvh lg:grid-cols-2">
        <aside className="bg-primary-deep relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(93,202,165,0.35), transparent), radial-gradient(ellipse 60% 45% at 90% 85%, rgba(216,90,48,0.22), transparent)',
            }}
          />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
              <span className="bg-surface/15 text-surface flex size-11 items-center justify-center rounded-[var(--radius-card)] backdrop-blur">
                <span className="font-display text-xl font-semibold">+</span>
              </span>
              <span className="font-display text-surface text-lg font-semibold">ClinicEase</span>
            </Link>
          </div>
          <div className="relative max-w-md">
            <p className="text-primary-light text-sm font-medium tracking-wide">
              Your care, simplified
            </p>
            <h1 className="font-marketing text-surface mt-4 text-4xl leading-[1.15] font-medium">
              Calm booking. Live tokens. Fewer phone calls.
            </h1>
            <p className="text-surface/70 mt-5 text-[15px] leading-relaxed">
              Hourly capacity, transparent queues, and WhatsApp updates — for a clinic that
              respects your time.
            </p>
          </div>
          <p className="text-surface/45 relative text-xs">Secure sign-in · OTP ready</p>
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
            className="flex flex-1 items-center justify-center px-5 py-12 md:px-12"
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
