import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@siku_zangu:onboarding_complete';

/**
 * Mark onboarding as complete for a user
 * Call this after the user finishes the last onboarding screen (UpdatingMedicationScreen)
 */
export async function markOnboardingComplete(userId: string): Promise<boolean> {
    try {
        await AsyncStorage.setItem(
            `${ONBOARDING_COMPLETE_KEY}:${userId}`,
            'true'
        );
        return true;
    } catch (error) {
        console.error('Error marking onboarding as complete:', error);
        return false;
    }
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingComplete(userId: string): Promise<boolean> {
    try {
        const status = await AsyncStorage.getItem(
            `${ONBOARDING_COMPLETE_KEY}:${userId}`
        );
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