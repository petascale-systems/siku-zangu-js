import { messaging } from '../firebase/admin';
import { selectOneUserByUserId } from '@siku-zangu/knex';

export type NotificationType =
    | 'period_reminder'
    | 'fertile_window'
    | 'medication_reminder'
    | 'daily_insight';

interface NotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>;
}
export async function sendPushNotification(payload: NotificationPayload) {
    try {
        const user = await selectOneUserByUserId(payload.userId);
        if (!user?.kv?.fcm_token) {
            return null;
        }
        const shouldSend = checkNotificationPreference(user, payload.type);
        if (!shouldSend) {
            return null;
        }
        const message = {
            token: user.kv.fcm_token,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: {
                type: payload.type,
                userId: payload.userId,
                ...payload.data,
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
            android: {
                priority: 'high' as const,
                notification: {
                    sound: 'default',
                    channelId: 'default',
                    color: '#FF597D',
                },
            },
        };
        const response = await messaging.send(message);
        return response;

    } catch (error: any) {
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
        }

        throw error;
    }
}
function checkNotificationPreference(user: any, type: NotificationType): boolean {
    const kv = user.kv;
    switch (type) {
        case 'period_reminder':
            return kv.receive_period_alerts !== false;
        case 'fertile_window':
            return kv.receive_fertile_alerts !== false;
        case 'medication_reminder':
            return kv.receive_medication_tips !== false;
        case 'daily_insight':
            return kv.receive_insights_tips !== false;
        default:
            return true;
    }
}
export async function sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string
) {
    const results = await Promise.allSettled(
        userIds.map(userId =>
            sendPushNotification({ userId, type, title, body })
        )
    );
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    return { successful, failed, total: userIds.length };
}