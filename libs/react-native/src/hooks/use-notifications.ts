import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { postJSON } from '../../../react/src/post-json.function';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});
export function useNotifications(userId?: string) {
    const [devicePushToken, setDevicePushToken] = useState<string>();
    const [notification, setNotification] = useState<Notifications.Notification>();
    const [notificationResponse, setNotificationResponse] = useState<Notifications.NotificationResponse>();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        if (!userId) {
            return;
        }
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setDevicePushToken(token);
                saveFCMToken(userId, token);
            }
        }).catch(error => {
        });
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            setNotificationResponse(response);
        });

        // Check if app was opened from a notification (killed state)
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                setNotificationResponse(response);
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [userId]);

    return {
        expoPushToken: devicePushToken,
        notification,
        notificationResponse,
    };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF597D',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            token = (await Notifications.getDevicePushTokenAsync()).data as string;
        } catch (error) {
        }
    } else {
    }

    return token;
}

async function saveFCMToken(userId: string, token: string) {
    try {
        await postJSON(`/api/users/${userId}/fcm-token`, { fcm_token: token });
    } catch (error) {
    }
}