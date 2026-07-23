import cron from 'node-cron'
import { releaseExpiredHolds } from '../services/booking.js'
import { expireWaitlistOffers } from '../services/waitlist.js'
import { sendReminders } from '../services/notifications.js'

export function startJobs() {
  cron.schedule('* * * * *', async () => {
    try {
      await releaseExpiredHolds()
      await expireWaitlistOffers()
    } catch (e) {
      console.error('[jobs] hold/waitlist', e)
    }
  })

  cron.schedule('*/15 * * * *', async () => {
    try {
      const n = await sendReminders()
      if (n) console.log(`[jobs] reminders sent: ${n}`)
    } catch (e) {
      console.error('[jobs] reminders', e)
    }
  })
}
