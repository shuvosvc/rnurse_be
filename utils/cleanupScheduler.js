const cron = require('node-cron');
const database = require('../utils/connection');
// Runs every 30 minutes (change schedule as you want)
cron.schedule('0 18 * * *', async () => {
  let connection;
  try {
    connection = await database.getConnection();
    await connection.beginTransaction();

    const result = await connection.query('SELECT cleanup_expired_tokens();');

    await connection.commit();
    await connection.release();

    console.log(`[Cleanup] Expired tokens cleaned at ${new Date().toISOString()}`);
  } catch (err) {
    if (connection) {
      await connection.rollback();
      await connection.release();
    }
    console.log('[Cleanup] Failed to clean expired tokens:', err);
  }
});
