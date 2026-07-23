import { LiveRegion } from '@/a11y'

/** Announces live queue / ETA changes to screen readers. */
export function QueueLiveAnnouncer({
  servingToken,
  yourToken,
  etaWindow,
}: {
  servingToken: number
  yourToken?: number
  etaWindow?: string
}) {
  const message = yourToken
    ? `Currently serving token ${servingToken}. Your token is ${yourToken}${etaWindow ? `. Estimated window ${etaWindow}` : ''}. Estimates are not guarantees.`
    : `Currently serving token ${servingToken}.`

  return <LiveRegion message={message} politeness="polite" />
}
