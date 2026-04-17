import cron from 'node-cron';
import { userRepository } from '../repositories/user.repository';

export async function runCleanupUnverifiedUsers(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await userRepository.deleteUnverifiedBefore(cutoff);
  if (result.count > 0) {
    console.log(`[cleanup] Deleted ${result.count} unverified user(s)`);
  }
}

export function scheduleCleanupUnverifiedUsers(): void {
  cron.schedule('0 * * * *', runCleanupUnverifiedUsers);
}
