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
        // Fetch user from database
        const user = await selectOneUserByUserId(payload.userId);

        if (!user?.kv?.fcm_token) {
            console.log(`⚠️ No FCM token for user ${payload.userId}`);
            return null;
        }

        // Check if user wants this type of notifications
        const shouldSend = checkNotificationPreference(user, payload.type);
        if (!shouldSend) {
            console.log(`⚠️ User ${payload.userId} disabled ${payload.type} notifications`);
            return null;
        }

        // Prepare notifications message
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

        // Send notifications via FCM
        const response = await messaging.send(message);
        console.log('✅ Notification sent successfully:', response);
        return response;

    } catch (error: any) {
        console.error('❌ Error sending notifications:', error);

        // Handle invalid token errors
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.log(`🗑️ Invalid token for user ${payload.userId}`);
            // TODO: Remove invalid token from database
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

// Utility function to send to multiple users
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

    console.log(`📊 Bulk send: ${successful} succeeded, ${failed} failed`);
    return { successful, failed, total: userIds.length };
}