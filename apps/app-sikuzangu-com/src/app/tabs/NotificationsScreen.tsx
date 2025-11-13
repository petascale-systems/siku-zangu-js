import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUser } from '@siku-zangu/react';
import { UpdateUser } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';



interface NotificationSetting {
  id: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  icon: string;
  iconBg: string;
  enabled: boolean;
}

export default function NotificationsScreen  () {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { user, upsertUser, isUpsertingUser } = useUser(userId);

  const [initialNotifications, setInitialNotifications] = useState<NotificationSetting[]>([]);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'period',
      title: 'Period arrival reminders',
      titleSw: 'Ukumbusho wa kuwasili kwa hedhi',
      description: 'Get a reminder before your period starts.',
      descriptionSw: 'Pata ukumbusho kabla hedhi yako haijaanza.',
      icon: '💧',
      iconBg: '#B3E5FC',
      enabled: false,
    },
    {
      id: 'fertile',
      title: 'Fertile days alerts',
      titleSw: 'Arifa za siku za uzazi',
      description: 'Know your most fertile days',
      descriptionSw: 'Jua siku zako za juu zaidi za uzazi',
      icon: '🌸',
      iconBg: '#FFE4EC',
      enabled: false,
    },
    {
      id: 'medication',
      title: 'Receive Medication reminders',
      titleSw: 'Pokea vikumbusho vya dawa',
      description: 'Stay on track with medicines or supplements.',
      descriptionSw: 'Endelea kufuatilia dawa au virutubisho.',
      icon: '💊',
      iconBg: '#FFE0E6',
      enabled: false,
    },
    {
      id: 'insights',
      title: 'Insights & tips',
      titleSw: 'Maarifa na vidokezo',
      description: 'Receive daily or weekly tips made for you',
      descriptionSw: 'Pokea vidokezo vya kila siku au wiki vilivyotengenezwa kwa ajili yako',
      icon: '💡',
      iconBg: '#FFF9C4',
      enabled: false,
    },
  ]);
  React.useEffect(() => {
    if (!user?.kv) return;

    const updatedNotifications = notifications.map(notif => {
      let enabledValue: boolean | undefined;

      switch(notif.id) {
        case 'period':
          enabledValue = user.kv.receive_period_alerts;
          break;
        case 'fertile':
          enabledValue = user.kv.receive_fertile_alerts;
          break;
        case 'medication':
          enabledValue = user.kv.receive_medication_tips;
          break;
        case 'insights':
          enabledValue = user.kv.receive_insights_tips;
          break;
        default:
          enabledValue = notif.enabled;
      }

      return {
        ...notif,
        enabled: enabledValue !== undefined ? enabledValue : notif.enabled
      };
    });

    setNotifications(updatedNotifications);
    setInitialNotifications(JSON.parse(JSON.stringify(updatedNotifications)));
  }, [user]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleSavePreferences = async () => {
    // Check if there are any changes
    const hasChanges = notifications.some((notif, index) => {
      const initial = initialNotifications[index];
      return initial && notif.enabled !== initial.enabled;
    });

    if (!hasChanges) {
      Alert.alert(
        language === 'sw' ? 'Hakuna Mabadiliko' : 'No Changes',
        language === 'sw'
          ? 'Hakuna mabadiliko ya kuhifadhi.'
          : 'No changes to save.'
      );
      return;
    }

    try {
      const updates: Partial<UpdateUser['kv']> = {
        receive_period_alerts: notifications.find(n => n.id === 'period')?.enabled,
        receive_fertile_alerts: notifications.find(n => n.id === 'fertile')?.enabled,
        receive_medication_tips: notifications.find(n => n.id === 'medication')?.enabled,
        receive_insights_tips: notifications.find(n => n.id === 'insights')?.enabled,
      };

      await upsertUser({ kv: updates });

      Alert.alert(
        language === 'sw' ? 'Mafanikio' : 'Success',
        language === 'sw'
          ? 'Mapendeleo yamehifadhiwa!'
          : 'Preferences saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setInitialNotifications(JSON.parse(JSON.stringify(notifications)));
            }
          }
        ]
      );
    } catch (e: any) {
      Alert.alert(
        language === 'sw' ? 'Hitilafu' : 'Error',
        e.message || (language === 'sw' ? 'Imeshindwa kuhifadhi' : 'Failed to save')
      );
    }
  };

  const handleBack = () => router.back();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'sw' ? 'Arifa' : 'Notifications'}
        </Text>
        <Ionicons name="notifications" size={22} color="#999" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.heroIcon}><Ionicons name="calendar" size={24} color="#FD5A7E" /></Text>
            <View style={styles.badge}>
              <Ionicons name="notifications" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroTitle}>
            {language === 'sw'
              ? 'Endelea kufuatilia mzunguko wako'
              : 'Stay on top of your cycle'}
          </Text>
          <Text style={styles.heroDescription}>
            {language === 'sw'
              ? 'Dhibiti arifa zako za hedhi, dirisha la uzazi, na vikumbusho'
              : 'Manage your alerts for period, fertile window, and reminders'}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {notifications.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.settingCard,
                index === notifications.length - 1 && styles.lastCard,
              ]}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
                  <Text style={styles.settingEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>
                    {language === 'sw' ? item.titleSw : item.title}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {language === 'sw' ? item.descriptionSw : item.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleNotification(item.id)}
                trackColor={{ false: '#D1D5DB', true: '#FF597D' }}
                thumbColor="#fff"
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isUpsertingUser && styles.saveButtonDisabled,
          ]}
          onPress={handleSavePreferences}
          disabled={isUpsertingUser}
          activeOpacity={0.8}
          accessibilityLabel={
            language === 'sw' ? 'Hifadhi mapendeleo' : 'Save Preferences'
          }
        >
          {isUpsertingUser ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {language === 'sw' ? 'Hifadhi Mapendeleo' : 'Save Preferences'}
            </Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FD5A7E',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  heroIcon: {
    fontSize: 36,
  },
  badge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF597D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontStyle: 'normal',
  },
  heroDescription: {
    fontSize: 14,
    color: '#645F5F',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  settingDescription: {
    fontSize: 14,
    color: '#645F5F',
    lineHeight: 18,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  saveButton: {
    backgroundColor: '#FF597D',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD5A7E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 100,
    marginHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter',
  },
});