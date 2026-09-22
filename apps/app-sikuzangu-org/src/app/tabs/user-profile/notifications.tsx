import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {UserKv} from '@siku-zangu/core';
import {
  colors,
  typography,
  useLanguage,
  useTabContentInset,
  useToast,
  useResetStackOnBlur,
  NUIButton,
  NUISwitch,
  layout,
  spacing,
  radius
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface NotificationSetting {
  id: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  iconType: 'ionicons' | 'material';
  iconName: string;
  iconBg: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  // Leaving the Profile tab returns it to the Profile screen.
  useResetStackOnBlur();
  const tabInset = useTabContentInset();
  const { showError, showInfo, showSuccess } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const userId = params.userId as string;
  const { user, updateCurrentUser, isUpsertingUser } = useUser(userId);

  const [initialNotifications, setInitialNotifications] = useState<
      NotificationSetting[]
  >([]);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'period',
      title: 'Period arrival reminders',
      titleSw: 'Ukumbusho wa kuwasili kwa hedhi',
      description: 'Get a reminder before your period starts.',
      descriptionSw: 'Pata ukumbusho kabla hedhi yako haijaanza.',
      iconType: 'ionicons',
      iconName: 'water',
      iconBg: '#B3E5FC',
      enabled: false,
    },
    {
      id: 'fertile',
      title: 'Fertile days alerts',
      titleSw: 'Arifa za siku za uzazi',
      description: 'Know your most fertile days',
      descriptionSw: 'Jua siku zako za juu zaidi za uzazi',
      iconType: 'ionicons',
      iconName: 'flower',
      iconBg: '#FFE4EC',
      enabled: false,
    },
    {
      id: 'medication',
      title: 'Receive Medication reminders',
      titleSw: 'Pokea vikumbusho vya dawa',
      description: 'Stay on track with medicines or supplements.',
      descriptionSw: 'Endelea kufuatilia dawa au virutubisho.',
      iconType: 'material',
      iconName: 'pill',
      iconBg: '#FFE0E6',
      enabled: false,
    },
    {
      id: 'insights',
      title: 'Insights & tips',
      titleSw: 'Maarifa na vidokezo',
      description: 'Receive daily or weekly tips made for you',
      descriptionSw:
          'Pokea vidokezo vya kila siku au wiki vilivyotengenezwa kwa ajili yako',
      iconType: 'ionicons',
      iconName: 'bulb',
      iconBg: '#FFF9C4',
      enabled: false,
    },
    {
      id: 'new_articles',
      title: 'New articles',
      titleSw: 'Makala mpya',
      description: 'Get notified when new articles are published',
      descriptionSw: 'Pata arifa makala mpya zinapochapishwa',
      iconType: 'ionicons',
      iconName: 'newspaper',
      iconBg: '#E1BEE7',
      enabled: false,
    },
  ]);

  // Seed once: a background refetch used to revert toggles the user had
  // flipped but not yet saved, after which Save reported "No Changes".
  const hasSeededRef = React.useRef(false);

  React.useEffect(() => {
    hasSeededRef.current = false;
  }, [userId]);

  React.useEffect(() => {
    if (!user?.kv || hasSeededRef.current) return;
    hasSeededRef.current = true;

    const toBool = (val: any): boolean | undefined => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val !== 'false';
      return !!val;
    };

    setNotifications((prev) => {
      const updatedNotifications = prev.map((notif) => {
      let enabledValue: boolean | undefined;

      switch (notif.id) {
        case 'period':
          enabledValue = toBool(user.kv.receive_period_alerts);
          break;
        case 'fertile':
          enabledValue = toBool(user.kv.receive_fertile_alerts);
          break;
        case 'medication':
          enabledValue = toBool(user.kv.receive_medication_tips);
          break;
        case 'insights':
          enabledValue = toBool(user.kv.receive_insights_tips);
          break;
        case 'new_articles':
          enabledValue = toBool(user.kv.receive_new_articles);
          break;
        default:
          enabledValue = notif.enabled;
      }

      return {
        ...notif,
        enabled: enabledValue !== undefined ? enabledValue : notif.enabled,
      };
    });

      setInitialNotifications(JSON.parse(JSON.stringify(updatedNotifications)));
      return updatedNotifications;
    });
  }, [user]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
        prev.map((notif) =>
            notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
        )
    );
  };

  const handleSavePreferences = async () => {
    const hasChanges = notifications.some((notif, index) => {
      const initial = initialNotifications[index];
      return initial && notif.enabled !== initial.enabled;
    });

    if (!hasChanges) {
      showInfo(language === 'sw'
              ? 'Hakuna mabadiliko ya kuhifadhi.'
              : 'No changes to save.');
      return;
    }

    try {
      const updates: UserKv = {
        receive_period_alerts: notifications.find((n) => n.id === 'period')
            ?.enabled,
        receive_fertile_alerts: notifications.find((n) => n.id === 'fertile')
            ?.enabled,
        receive_medication_tips: notifications.find(
            (n) => n.id === 'medication'
        )?.enabled,
        receive_insights_tips: notifications.find((n) => n.id === 'insights')
            ?.enabled,
        receive_new_articles: notifications.find((n) => n.id === 'new_articles')
            ?.enabled,
      };

      await updateCurrentUser({ kv: updates });

      showSuccess(
          language === 'sw'
              ? 'Mapendeleo yamehifadhiwa!'
              : 'Preferences saved successfully!'
      );
      setInitialNotifications(JSON.parse(JSON.stringify(notifications)));
      router.push({
        pathname: '/tabs/user-profile',
        params: { lang: language, userId },
      });
    } catch (e: any) {
      showError(e.message ||
          (language === 'sw' ? 'Imeshindwa kuhifadhi' : 'Failed to save'));
    }
  };

  const renderIcon = (item: NotificationSetting) => {
    const iconColor = '#FF597D';
    const iconSize = 24;

    if (item.iconType === 'material') {
      return (
          <MaterialCommunityIcons
              name={item.iconName as any}
              size={iconSize}
              color={iconColor}
          />
      );
    }

    return (
        <Ionicons
            name={item.iconName as any}
            size={iconSize}
            color={iconColor}
        />
    );
  };


  return (
      <View style={styles.container}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabInset },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={32} color="#FD5A7E" />
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
                    ]}
                >
                  <NUISwitch
                      value={item.enabled}
                      onValueChange={() => toggleNotification(item.id)}
                      label={language === 'sw' ? item.titleSw : item.title}
                      description={
                        language === 'sw' ? item.descriptionSw : item.description
                      }
                      leading={
                        <View
                            style={[
                              styles.settingIcon,
                              { backgroundColor: item.iconBg },
                            ]}
                        >
                          {renderIcon(item)}
                        </View>
                      }
                  />
                </View>
            ))}
          </View>

          <NUIButton
              title={
                language === 'sw' ? 'Hifadhi Mapendeleo' : 'Save Preferences'
              }
              onPress={handleSavePreferences}
              loading={isUpsertingUser}
              accessibilityLabel={
                language === 'sw' ? 'Hifadhi mapendeleo' : 'Save Preferences'
              }
              style={styles.saveButton}
          />
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
    paddingHorizontal: layout.screenGutter,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: layout.screenGutter,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    width: 50,
    height: 50,
    // Was 40 on a 50pt box — it clamped to a circle, but only by accident.
    borderRadius: 25,
    backgroundColor: colors.surface.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  heroTitle: {
    ...typography.headingSm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontStyle: 'normal',
  },
  heroDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  settingsContainer: {
    marginBottom: layout.sectionGap,
    gap: spacing.sm + 4,
  },
  settingCard: {
    // Surface only. The row layout moved into NUISwitch, and the container
    // already gaps these — the marginBottom here was doubling it.
    backgroundColor: colors.surface.card,
    borderRadius: radius.sm + 4,
    paddingHorizontal: spacing.md,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saveButton: {
    // Layout only — the primary tier supplies fill, radius and padding.
    marginTop: layout.sectionGap,
  },
});