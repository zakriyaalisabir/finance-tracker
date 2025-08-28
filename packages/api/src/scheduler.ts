import cron from 'node-cron';
import { postSubscriptions, addNetWorthSnapshot } from './dynamo';
import { CRON_SCHEDULES } from './constants';

/**
 * Starts the cron job scheduler for automated finance tasks
 * - Daily subscription check at 9 AM
 * - Monthly net worth snapshot on 1st at 10 AM
 */
export function startScheduler(): void {
  // Daily subscription check at 9 AM
  cron.schedule(CRON_SCHEDULES.DAILY_SUBSCRIPTIONS, async () => {
    console.log("Running daily subscription check...");
    await postSubscriptions();
  });

  // Monthly net worth snapshot on 1st at 10 AM
  cron.schedule(CRON_SCHEDULES.MONTHLY_NETWORTH, async () => {
    console.log("Creating monthly net worth snapshot...");
    // This would typically pull from bank APIs or manual input
    const snapshot = {
      accounts: {
        "Checking": 50000,
        "Savings": 200000,
        "Credit Card": -15000
      },
      assets: 250000,
      liabilities: -15000,
      netWorth: 235000
    };
    await addNetWorthSnapshot(snapshot);
  });
}