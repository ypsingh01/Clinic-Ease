import { LiveRegion } from '@/a11y'

/** Announces live queue / ETA changes to screen readers with plain language. */
export function QueueLiveAnnouncer({
  servingToken,
  yourToken,
  etaWindow,
  peopleAhead,
}: {
  servingToken: number
  yourToken?: number
  etaWindow?: string
  peopleAhead?: number
}) {
  let message = `Currently serving token ${servingToken}.`
  if (yourToken != null) {
    const ahead =
      peopleAhead != null
        ? peopleAhead === 0
          ? "You're next."
          : peopleAhead === 1
            ? '1 person ahead of you.'
            : `${peopleAhead} people ahead of you.`
        : ''
    message = `Currently serving token ${servingToken}. Your token is ${yourToken}. ${ahead}${
      etaWindow ? ` Estimated window ${etaWindow}.` : ''
    } Estimates are not guarantees.`
  }

  return <LiveRegion message={message} politeness="polite" />
}
