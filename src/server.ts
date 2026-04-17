import 'dotenv/config';
import app from './app';
import { scheduleCleanupUnverifiedUsers } from './jobs/cleanup-unverified-users.job';
import { scheduleSettleLots } from './jobs/settle-lots.job';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleCleanupUnverifiedUsers();
  scheduleSettleLots();
});
