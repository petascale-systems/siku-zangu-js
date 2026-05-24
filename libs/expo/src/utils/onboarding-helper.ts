import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateUser, fetchUserById} from '@siku-zangu/react-native';

const ONBOARDING_COMPLETE_KEY = '@siku_zangu:onboarding_complete';

/**
 * Mark onboarding as complete: persist to the user record on the server AND mirror to AsyncStorage for offline reads.
 * Call this after the user finishes the last onboarding screen (UpdatingMedicationScreen).
 */
export async function markOnboardingComplete(userId: string): Promise<boolean> {
    let serverOk = false;
    try {
        await updateUser(userId, {kv: {onboarding_complete: true}});
        serverOk = true;
    } catch (error) {
        console.error('Error persisting onboarding_complete to user record:', error);
    }
    try {
        await AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}:${userId}`, 'true');
    } catch (error) {
        console.error('Error mirroring onboarding_complete to AsyncStorage:', error);
    }
    return serverOk;
}

/**
 * Check if user has completed onboarding. Prefers the server record (works across devices); falls back to AsyncStorage
 * if the server is unreachable (offline-safe).
 */
export async function isOnboardingComplete(userId: string): Promise<boolean> {
    try {
        const user = await fetchUserById(userId);
        if (user?.kv?.onboarding_complete === true) {
            AsyncStorage.setItem(`${ONBOARDING_COMPLETE_KEY}:${userId}`, 'true').catch(() => undefined);
            return true;
        }
        if (user?.kv?.onboarding_complete === false) return false;
    } catch {
        // server unreachable — fall through to local cache
    }
    try {
        const status = await AsyncStorage.getItem(`${ONBOARDING_COMPLETE_KEY}:${userId}`);
        return status === 'true';
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
}

/**
 * Clear onboarding status (for logout/reset)
 */
export async function clearOnboardingStatus(userId: string): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(
            `${ONBOARDING_COMPLETE_KEY}:${userId}`
        );
        return true;
    } catch (error) {
        console.error('Error clearing onboarding status:', error);
        return false;
    }
}