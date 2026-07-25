import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconArrowRight } from '@tabler/icons-react'
import { Logo } from '@/components/brand/Logo'
import { Button, Card } from '@/components/ui'
import { SkipLink } from '@/a11y'
import { fadeUp, staggerContainer, staggerItem } from '@/motion/variants'
import { homePathForRole, useAuth } from '@/auth/AuthContext'

export function WelcomePage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <SkipLink />
      <div id="main-content" className="bg-bg text-text mx-auto flex min-h-dvh max-w-[var(--content-max)] flex-col px-6 py-10 md:px-8">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/dev/ui" className="text-text-secondary hidden text-sm no-underline sm:inline">
              Design system
            </Link>
            {isAuthenticated && user ? (
              <Link to={homePathForRole(user.role)} className="no-underline">
                <Button size="sm">Open {user.role} portal</Button>
              </Link>
            ) : (
              <Link to="/login" className="no-underline">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </header>

        <motion.div
          className="flex flex-1 flex-col justify-center py-16"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <p className="text-primary text-sm font-medium tracking-wide">ClinicEase</p>
          <h1 className="font-marketing mt-3 max-w-2xl text-3xl leading-[1.15] font-medium md:text-4xl">
            Your care, simplified
          </h1>
          <p className="text-text-secondary mt-4 max-w-xl text-base leading-relaxed">
            Next-level digital health craft — calm booking, live tokens, and clear portals for
            patients, doctors, and clinic staff.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="no-underline">
              <Button rightIcon={<IconArrowRight size={18} stroke={1.5} />}>
                Enter the product
              </Button>
            </Link>
            <Link to="/dev/ui" className="no-underline">
              <Button variant="secondary">View design system</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 pb-12 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {(
            [
              ['Patient', 'Guided care journey', '/login'],
              ['Doctor', 'Live clinic command', '/login'],
              ['Admin', 'Calm clinic operations', '/login'],
            ] as const
          ).map(([title, body]) => (
            <motion.div key={title} variants={staggerItem}>
              <Card padding="md" className="h-full">
                <p className="font-display text-[15px] font-medium">{title}</p>
                <p className="text-text-secondary mt-1 text-sm">{body}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  )
}
