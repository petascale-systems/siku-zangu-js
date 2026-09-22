import { NextRequest } from 'next/server';
import {handleAPIError} from '@siku-zangu/core';
import {schedulePeriodReminders, scheduleFertileWindowAlerts, scheduleMedicationReminders, scheduleDailyInsights, scheduleNewArticleNotifications} from '@siku-zangu/knex';

export async function GET(req: NextRequest) {
    return handleAPIError(async () => {
        // Verify cron secret.
        // With CRON_SECRET unset this compared against the literal
        // "Bearer undefined", so anyone sending that header could fire push
        // notifications at every user. No secret now means no access.
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
            console.warn('[cron] CRON_SECRET is not set; refusing to run.');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${cronSecret}`) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('⏰ Starting scheduled notifications...');
        const startTime = Date.now();

        const [periodCount, fertileCount, medicationCount, insightsCount, newArticlesCount] = await Promise.all([
            schedulePeriodReminders(),
            scheduleFertileWindowAlerts(),
            scheduleMedicationReminders(),
            scheduleDailyInsights(),
            scheduleNewArticleNotifications(),
        ]);

        const duration = Date.now() - startTime;

        console.log(`✅ Completed in ${duration}ms`);

        return Response.json({
            success: true,
            periodReminders: periodCount,
            fertileAlerts: fertileCount,
            medicationReminders: medicationCount,
            dailyInsights: insightsCount,
            newArticles: newArticlesCount,
            duration: `${duration}ms`
        }, { status: 200 });
    });
}