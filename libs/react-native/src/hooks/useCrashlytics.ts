import { useEffect } from 'react';
import crashlytics from '@react-native-firebase/crashlytics';

export function useCrashlytics(userId?: string | null) {
    useEffect(() => {
        crashlytics().setCrashlyticsCollectionEnabled(true);
        if (userId) {
            crashlytics().setUserId(userId);
        }
        crashlytics().log('Crashlytics initialized');
    }, [userId]);
    return {
        logError: (error: Error, context?: string) => {
            if (context) {
                crashlytics().log(context);
            }
            crashlytics().recordError(error);
        },
        logMessage: (message: string) => {
            crashlytics().log(message);
        },
        setAttribute: (key: string, value: string) => {
            crashlytics().setAttribute(key, value);
        },
        testCrash: () => {
            crashlytics().crash();
        }
    };
}