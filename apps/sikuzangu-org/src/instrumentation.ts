export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = await import('node-cron');
        const {
            schedulePeriodReminders,
            scheduleFertileWindowAlerts,
            scheduleMedicationReminders,
            scheduleDailyInsights,
            scheduleNewArticleNotifications,
        } = await import('@siku-zangu/knex');

        // Run notifications every day at 8:00 AM EAT (5:00 AM UTC)
        cron.default.schedule('0 5 * * *', async () => {
            console.log('⏰ Starting scheduled notifications...');
            const startTime = Date.now();

            try {
                const [periodCount, fertileCount, medicationCount, insightsCount, newArticlesCount] = await Promise.all([
                    schedulePeriodReminders(),
                    scheduleFertileWindowAlerts(),
                    scheduleMedicationReminders(),
                    scheduleDailyInsights(),
                    scheduleNewArticleNotifications(),
                ]);

                const duration = Date.now() - startTime;
                console.log(`✅ Notifications completed in ${duration}ms:`, {
                    periodReminders: periodCount,
                    fertileAlerts: fertileCount,
                    medicationReminders: medicationCount,
                    dailyInsights: insightsCount,
                    newArticles: newArticlesCount,
                });
            } catch (error) {
                console.error('❌ Notification cron failed:', error);
            }
        });

        console.log('🔔 Notification cron scheduled: daily at 8:00 AM EAT');
    }
}
