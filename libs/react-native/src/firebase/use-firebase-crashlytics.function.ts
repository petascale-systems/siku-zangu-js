/*import {useEffect} from 'react';
//import crashlytics from '@react-native-firebase/crashlytics';

export function useFirebaseCrashlytics(userId?: string | null) {
    function logError(error: Error, context?: string) {
        if (context) crashlytics().log(context);
        crashlytics().recordError(error);
    }

    function logMessage(message: string) {
        crashlytics().log(message);
    }

    async function setAttribute(key: string, value: string) {
        await crashlytics().setAttribute(key, value);
    }

    function testCrash() {
        crashlytics().crash();
    }

    useEffect(() => {
        crashlytics().setCrashlyticsCollectionEnabled(true).then(async () => {
            if (userId) await crashlytics().setUserId(userId);
            crashlytics().log('Crashlytics initialized');
        })
    }, [userId]);

    return {logError, logMessage, setAttribute, testCrash};
} */