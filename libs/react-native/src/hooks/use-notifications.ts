import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { postJSON } from '../../../react/src/post-json.function';

// Configure notifications handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export function useNotifications(userId?: string) {
    const [expoPushToken, setExpoPushToken] = useState<string>();
    const [notification, setNotification] = useState<Notifications.Notification>();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        if (!userId) {
            console.log('⚠️ No userId provided, skipping notification setup');
            return;
        }

        console.log('🔔 Setting up notifications for user:', userId);

        // Register for push notifications
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                console.log('📱 Expo Push Token:', token);
                setExpoPushToken(token);

                // Send token to backend
                saveFCMToken(userId, token);
            }
        }).catch(error => {
            console.error('❌ Error registering for notifications:', error);
        });

        // Listen for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('🔔 Notification received:', notification);
            setNotification(notification);
        });

        // Listen for notification taps
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👆 Notification tapped:', response);
            const data = response.notification.request.content.data;
            console.log('📦 Notification data:', data);
            // TODO: Handle navigation based on notification type
        });

        return () => {
            // Fixed: Use .remove() instead of removeNotificationSubscription()
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [userId]);

    return {
        expoPushToken,
        notification,
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
            console.log('❌ Permission not granted for push notifications');
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.error('❌ No project ID found in app config');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('✅ Push token obtained:', token);
        } catch (error) {
            console.error('❌ Error getting push token:', error);
        }
    } else {
        console.log('⚠️ Must use physical device for Push Notifications');
    }

    return token;
}

async function saveFCMToken(userId: string, token: string) {
    try {
        console.log(`📤 Saving FCM token for user ${userId}...`);
        await postJSON(`/api/users/${userId}/fcm-token`, { fcm_token: token });
        console.log('✅ FCM token saved to backend');
    } catch (error) {
        console.error('❌ Error saving FCM token:', error);
    }
}