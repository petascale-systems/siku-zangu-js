import { selectUsersPage } from '@siku-zangu/knex';
import { sendPushNotification } from '@siku-zangu/knex';

function calculateCycleMetrics(
    prevCycleStartDate: string,
    avgCycleLengthDays: number = 28
) {
    const startDate = new Date(prevCycleStartDate);
    const today = new Date();
    const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayInCycle = daysSinceStart % avgCycleLengthDays;
    const daysUntilPeriod = avgCycleLengthDays - dayInCycle;
    const ovulationDay = avgCycleLengthDays - 14;
    const daysUntilOvulation = ovulationDay - dayInCycle;
    const fertileDaysRemaining = Math.max(0, daysUntilOvulation + 5);
    return {
        daysUntilPeriod,
        daysUntilOvulation,
        fertileDaysRemaining,
    };
}
export async function schedulePeriodReminders() {
    let page = 1;
    const size = 50;
    let totalSent = 0;
    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });
        for (const user of usersPage.data) {
            if (!user.kv?.receive_period_alerts ||
                !user.kv?.prev_cycle_start_date ||
                !user.kv?.fcm_token) {
                continue;
            }
            const metrics = calculateCycleMetrics(
                user.kv.prev_cycle_start_date,
                user.kv.avg_cycle_length_days || 28
            );
            const lang = user.kv.language || 'en';
            if (metrics.daysUntilPeriod === 2) {
                await sendPushNotification({
                    userId: user.user_id!,
                    type: 'period_reminder',
                    title: lang === 'sw'
                        ? 'Ukumbusho wa Hedhi'
                        : 'Period Reminder',
                    body: lang === 'sw'
                        ? 'Hedhi yako inatarajiwa katika siku 2'
                        : 'Your period is expected in 2 days',
                    data: {
                        daysUntil: '2',
                    },
                });
                totalSent++;
            }
            if (metrics.daysUntilPeriod === 0) {
                await sendPushNotification({
                    userId: user.user_id!,
                    type: 'period_reminder',
                    title: lang === 'sw'
                        ? 'Hedhi Yako Leo'
                        : 'Period Today',
                    body: lang === 'sw'
                        ? 'Hedhi yako inatarajiwa kuanza leo'
                        : 'Your period is expected to start today',
                });
                totalSent++;
            }
        }
        if (page >= usersPage.last_page) break;
        page++;
    }
    return totalSent;
}
export async function scheduleFertileWindowAlerts() {
    let page = 1;
    const size = 50;
    let totalSent = 0;

    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });

        for (const user of usersPage.data) {
            if (!user.kv?.receive_fertile_alerts ||
                !user.kv?.prev_cycle_start_date ||
                !user.kv?.fcm_token) {
                continue;
            }
            const metrics = calculateCycleMetrics(
                user.kv.prev_cycle_start_date,
                user.kv.avg_cycle_length_days || 28
            );
            const lang = user.kv.language || 'en';
            if (metrics.daysUntilOvulation === 5 && metrics.fertileDaysRemaining > 0) {
                await sendPushNotification({
                    userId: user.user_id!,
                    type: 'fertile_window',
                    title: lang === 'sw'
                        ? 'Dirisha la Uzazi'
                        : 'Fertile Window',
                    body: lang === 'sw'
                        ? 'Dirisha lako la uzazi limeanza leo'
                        : 'Your fertile window has started today',
                });
                totalSent++;
            }
            if (metrics.daysUntilOvulation === 0) {
                await sendPushNotification({
                    userId: user.user_id!,
                    type: 'fertile_window',
                    title: lang === 'sw'
                        ? 'Siku ya Kupevuka kwa Yai'
                        : 'Ovulation Day',
                    body: lang === 'sw'
                        ? 'Leo ni siku yako ya kupevuka kwa yai'
                        : 'Today is your ovulation day',
                });
                totalSent++;
            }
        }
        if (page >= usersPage.last_page) break;
        page++;
    }
    return totalSent;
}