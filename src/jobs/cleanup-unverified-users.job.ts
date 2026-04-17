import cron from 'node-cron';
import { usersService } from '../services/users.service';

export async function runCleanupUnverifiedUsers(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await usersService.cleanupUnverified(cutoff);
  if (result.count > 0) {
    console.log(`[cleanup] Deleted ${result.count} unverified user(s)`);
  }
}

export function scheduleCleanupUnverifiedUsers(): void {
  cron.schedule('0 * * * *', runCleanupUnverifiedUsers);
}
