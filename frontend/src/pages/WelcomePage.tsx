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
      <div id="main-content" className="mx-auto flex min-h-dvh max-w-[1200px] flex-col px-6 py-8 md:px-8">
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
          <h1 className="font-display mt-3 max-w-2xl text-3xl leading-tight font-medium md:text-4xl">
            Your care, simplified
          </h1>
          <p className="text-text-secondary mt-4 max-w-xl text-base leading-relaxed">
            Phase 3 is live: polished auth and role shells. Full marketing landing arrives next;
            portals already have real navigation and lived-in home screens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="no-underline">
              <Button rightIcon={<IconArrowRight size={18} stroke={1.5} />}>
                Enter the product
              </Button>
            </Link>
            <Link to="/dev/ui" className="no-underline">
              <Button variant="ghost">View component library</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-3 pb-10 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {(
            [
              ['Patient', 'Guided care journey', '/login'],
              ['Doctor', 'Live clinic command', '/login'],
              ['Admin', 'Operations cockpit', '/login'],
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
