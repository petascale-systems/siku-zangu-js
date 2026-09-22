import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {
  colors,
  typography,
  useLanguage,
  useTabContentInset,
  useToast,
  useResetStackOnBlur,
  NUIButton,
  confirmAsync
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function DeleteAccountScreen() {
  // Leaving the Profile tab returns it to the Profile screen.
  useResetStackOnBlur();
  const tabInset = useTabContentInset();
  const { showError, showSuccess } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const userId = params.userId as string;
  const { deleteUser, isDeletingUser } = useUser(userId);

  const [selectedReason] = useState<string | null>(null);

  const handleBack = () => router.back();

  const handleDeleteAccount = async () => {
    const confirmed = await confirmAsync({
      title: language === 'sw' ? 'Thibitisha Kufuta' : 'Confirm Deletion',
      message:
        language === 'sw'
          ? 'Je, una uhakika unataka kufuta akaunti yako? Hatua hii haiwezi kutendeka nyuma na data yako yote itapotea.'
          : 'Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.',
      confirmLabel:
        language === 'sw'
          ? 'Ndio, Futa Akaunti Yangu'
          : 'Yes, Delete My Account',
      cancelLabel: language === 'sw' ? 'Ghairi' : 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteUser();
      showSuccess(
        language === 'sw'
          ? 'Akaunti yako imefutwa kikamilifu.'
          : 'Your account has been successfully deleted.'
      );
      router.replace({
        pathname: '/auth/login',
        params: { lang: language },
      });
    } catch (e: any) {
      showError(
        e.message ||
          (language === 'sw'
            ? 'Imeshindwa kufuta akaunti. Tafadhali jaribu tena.'
            : 'Failed to delete account. Please try again.')
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabInset }]}
      >
        <Text style={styles.subtitle}>
          {language === 'sw'
            ? 'Tunasikitika kukuona unaondoka. Tafadhali tuambie kwa nini unafuta akaunti yako.'
            : "We're sorry to see you go. Please tell us why you're deleting your account."}
        </Text>

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color="#D97706" />
          <Text style={styles.warningText}>
            {language === 'sw'
              ? 'Kufuta akaunti yako ni kudumu na hakuwezi kutenduliwa nyuma. Data yako yote itapotea.'
              : 'Deleting your account is permanent and cannot be undone. All your data will be lost.'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <NUIButton
            variant="secondary"
            title={language === 'sw' ? 'Ghairi' : 'Cancel'}
            onPress={handleBack}
            // Matches the Cancel beside Save in updating-personal-info. While
            // the delete is in flight the destructive button blocks itself but
            // Cancel stayed live, so a tap navigated away from a request that
            // was still running.
            disabled={isDeletingUser}
          />

          <NUIButton
            variant="destructive"
            title={
              language === 'sw'
                ? 'Ndio, Futa Akaunti Yangu'
                : 'Yes, Delete My Account'
            }
            onPress={handleDeleteAccount}
            loading={isDeletingUser}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  content: {
    // Matches the Notifications screen, which had the only sensible padding
    // of the three: the other two ran their first line straight into the
    // header and let the last control sit on the bottom edge.
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: 24,
    fontWeight: '500',
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface.tint,
    borderRadius: 12,
    padding: 16,
    // Was 200, which shoved the warning most of a screen below the text it
    // qualifies purely to push the buttons down.
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  warningText: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
    marginTop: 40,
  },
});
