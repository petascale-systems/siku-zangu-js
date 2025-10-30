import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUser } from '@siku-zangu/react';

type Props = NativeStackScreenProps<RootStackParamList, 'DeleteAccount'>;

export const DeleteAccountScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const { deleteUser, isDeletingUser } = useUser(userId);
  const insets = useSafeAreaInsets();

  const [selectedReason] = useState<string | null>(null);

  const handleBack = () => navigation.goBack();

  const handleDeleteAccount = async () => {

    Alert.alert(
      language === 'sw' ? 'Thibitisha Kufuta' : 'Confirm Deletion',
      language === 'sw'
        ? 'Je, una uhakika unataka kufuta akaunti yako? Hatua hii haiwezi kutendeka nyuma na data yako yote itapotea.'
        : 'Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.',
      [
        {
          text: language === 'sw' ? 'Ghairi' : 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'sw' ? 'Ndio, Futa Akaunti Yangu' : 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser();

              Alert.alert(
                language === 'sw' ? 'Akaunti Imefutwa' : 'Account Deleted',
                language === 'sw'
                  ? 'Akaunti yako imefutwa kikamilifu.'
                  : 'Your account has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' as any }],
                      });
                    },
                  },
                ]
              );
            } catch (e: any) {
              Alert.alert(
                language === 'sw' ? 'Hitilafu' : 'Error',
                e.message ||
                (language === 'sw'
                  ? 'Imeshindwa kufuta akaunti. Tafadhali jaribu tena.'
                  : 'Failed to delete account. Please try again.')
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'sw' ? 'Futa Akaunti' : 'Delete Account'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              isDeletingUser && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteAccount}
            disabled={isDeletingUser}
            activeOpacity={0.8}
          >
            {isDeletingUser ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>
                {language === 'sw' ? 'Ndio, Futa Akaunti Yangu' : 'Yes, Delete My Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 6,
  },
   headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FD5A7E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Inter',
    fontWeight: '500',
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FDD5DE',
    borderRadius: 12,
    padding: 16,
    marginTop:200,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
    marginTop: 40,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3333333',
    fontFamily: 'Inter',
  },
  deleteButton: {
    backgroundColor: '#FF597D',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD5A7E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter',
  },
});