import {selectUsersPage, selectArticlesPage} from '@siku-zangu/knex';
import {sendPushNotification} from '@siku-zangu/knex';

function isDisabled(value: any): boolean {
    return value === false || value === 'false';
}

function calculateCycleMetrics(
    prevCycleStartDate: string,
    avgCycleLengthDays: number = 28
) {
    const startDate = new Date(prevCycleStartDate);
    const today = new Date();
    const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const rawDayInCycle = daysSinceStart % avgCycleLengthDays;
    const dayInCycle = rawDayInCycle === 0 ? 0 : rawDayInCycle;
    const daysUntilPeriod = rawDayInCycle === 0 ? 0 : avgCycleLengthDays - rawDayInCycle;
    const ovulationDay = avgCycleLengthDays - 14;
    const daysUntilOvulation = ovulationDay - dayInCycle;
    const fertileDaysRemaining = Math.max(0, daysUntilOvulation + 5);
    return {
        dayInCycle,
        daysUntilPeriod,
        daysUntilOvulation,
        fertileDaysRemaining,
        ovulationDay,
    };
}
export async function schedulePeriodReminders() {
    let page = 1;
    const size = 50;
    let totalSent = 0;
    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });
        for (const user of usersPage.items || []) {
            if (isDisabled(user.kv?.receive_period_alerts) ||
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
        if (page >= (usersPage.totalPages || 0)) break;
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

        for (const user of usersPage.items || []) {
            if (isDisabled(user.kv?.receive_fertile_alerts) ||
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
        if (page >= (usersPage.totalPages || 0)) break;
        page++;
    }
    return totalSent;
}

export async function scheduleMedicationReminders() {
    let page = 1;
    const size = 50;
    let totalSent = 0;

    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });

        for (const user of usersPage.items || []) {
            if (isDisabled(user.kv?.receive_medication_tips) ||
                !user.kv?.fcm_token ||
                !user.kv?.selected_medications?.length) {
                continue;
            }
            const lang = user.kv.language || 'en';
            await sendPushNotification({
                userId: user.user_id!,
                type: 'medication_reminder',
                title: lang === 'sw'
                    ? 'Ukumbusho wa Dawa'
                    : 'Medication Reminder',
                body: lang === 'sw'
                    ? 'Usisahau kutumia dawa yako leo'
                    : "Don't forget to take your medication today",
            });
            totalSent++;
        }
        if (page >= (usersPage.totalPages || 0)) break;
        page++;
    }
    return totalSent;
}

function getDailyInsightMessage(dayInCycle: number, ovulationDay: number, lang: string): { title: string; body: string } {
    // Menstrual phase (day 0-5, where 0 is period start day)
    if (dayInCycle >= 0 && dayInCycle <= 5) {
        return lang === 'sw'
            ? { title: 'Ushauri wa Kila Siku', body: 'Uko katika siku za hedhi. Kumbuka kunywa maji mengi na kupumzika vya kutosha.' }
            : { title: 'Daily Insight', body: 'You are in your menstrual phase. Remember to stay hydrated and get plenty of rest.' };
    }
    // Follicular phase (day 6 to ovulation-1)
    if (dayInCycle >= 6 && dayInCycle < ovulationDay) {
        return lang === 'sw'
            ? { title: 'Ushauri wa Kila Siku', body: 'Uko katika awamu ya follicular. Nishati yako inaongezeka — wakati mzuri wa mazoezi!' }
            : { title: 'Daily Insight', body: 'You are in your follicular phase. Your energy is rising — great time for exercise!' };
    }
    // Ovulation (ovulation day +/- 1)
    if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
        return lang === 'sw'
            ? { title: 'Ushauri wa Kila Siku', body: 'Uko karibu na siku ya kupevuka kwa yai. Fahamu kuhusu uwezo wako wa uzazi.' }
            : { title: 'Daily Insight', body: 'You are near ovulation. Be aware of your fertility during this time.' };
    }
    // Luteal phase (ovulation+2 to period)
    return lang === 'sw'
        ? { title: 'Ushauri wa Kila Siku', body: 'Uko katika awamu ya luteal. Jitunze — dalili za PMS zinaweza kutokea.' }
        : { title: 'Daily Insight', body: 'You are in your luteal phase. Practice self-care — PMS symptoms may occur.' };
}

export async function scheduleDailyInsights() {
    let page = 1;
    const size = 50;
    let totalSent = 0;

    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });

        for (const user of usersPage.items || []) {
            if (isDisabled(user.kv?.receive_insights_tips) ||
                !user.kv?.fcm_token ||
                !user.kv?.prev_cycle_start_date) {
                continue;
            }
            const metrics = calculateCycleMetrics(
                user.kv.prev_cycle_start_date,
                user.kv.avg_cycle_length_days || 28
            );
            const lang = user.kv.language || 'en';
            const message = getDailyInsightMessage(metrics.dayInCycle, metrics.ovulationDay, lang);
            await sendPushNotification({
                userId: user.user_id!,
                type: 'daily_insight',
                title: message.title,
                body: message.body,
            });
            totalSent++;
        }
        if (page >= (usersPage.totalPages || 0)) break;
        page++;
    }
    return totalSent;
}

export async function scheduleNewArticleNotifications() {
    const recentArticles = await selectArticlesPage({ page: 1, size: 50, status: 'published' });
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newArticles = (recentArticles.items || []).filter(article => {
        const updatedAt = article.updated_at ? new Date(article.updated_at) : null;
        return updatedAt && updatedAt >= oneDayAgo;
    });

    if (newArticles.length === 0) return 0;

    let totalSent = 0;
    let page = 1;
    const size = 50;

    while (true) {
        const usersPage = await selectUsersPage({ page, size, q: '' });

        for (const user of usersPage.items || []) {
            if (isDisabled(user.kv?.receive_new_articles) || !user.kv?.fcm_token) {
                continue;
            }

            const lang = user.kv.language || 'en';

            for (const article of newArticles) {
                if (article.kv?.language && article.kv.language !== lang) {
                    continue;
                }

                await sendPushNotification({
                    userId: user.user_id!,
                    type: 'new_article',
                    title: lang === 'sw'
                        ? 'Makala Mpya'
                        : 'New Article',
                    body: lang === 'sw'
                        ? `Soma: ${article.kv?.title || 'Makala mpya imepatikana'}`
                        : `Read: ${article.kv?.title || 'A new article is available'}`,
                    data: {
                        articleId: article.article_id || '',
                    },
                });
                totalSent++;
            }
        }
        if (page >= (usersPage.totalPages || 0)) break;
        page++;
    }
    return totalSent;
}
