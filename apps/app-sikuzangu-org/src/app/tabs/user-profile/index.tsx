import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@siku-zangu/react-native';
import {
  colors,
  typography,
  useLanguage,
  useSession,
  useTabContentInset,
  useToast,
  confirmAsync,
  NUICard
} from '@siku-zangu/expo';
import {useRouter, useFocusEffect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthProtection} from '@siku-zangu/expo';

interface MenuItem {
  id: string;
  iconType: 'ionicons' | 'material' | 'fontawesome';
  iconName: string;
  label: string;
  labelSw: string;
  onPress?: () => void;
  isDanger?: boolean;
}

export default function Profile() {
  const { showError } = useToast();
  useAuthProtection(true);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  // From the session store, not the route params: the native tab navigator
  // switches tabs without params, so params.userId was undefined on every tab
  // except the one that was navigated to directly.
  const { userId } = useSession();
  const tabInset = useTabContentInset();
  const { user, userUpdatedAt, refetchUser, isInitialFetching, isBackgroundFetching, error } = useUser(userId);
  const { logoutUser, isLoggingOut } = useSession();
  const MIN_DELAY_BETWEEN_REFRESHES = 30000;
  useFocusEffect(
      useCallback(() => {
        // Only a genuine revisit refetches. The initial load already owns the
        // first fetch, and the age is measured from when the data arrived — the
        // old `useRef(0)` read as infinitely stale on the first focus, so a
        // background refetch fired on top of the initial load.
        if (!userId || !refetchUser || !user) return;
        if (Date.now() - userUpdatedAt < MIN_DELAY_BETWEEN_REFRESHES) return;
        refetchUser(true);
      }, [userId, refetchUser, user, userUpdatedAt])
  );

  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      await refetchUser(true);
    }
  }, [refetchUser]);

  const memberSince = user?.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Aug 2025';

  async function handleLogout() {
    const confirmed = await confirmAsync({
      title: language === 'sw' ? 'Thibitisha Kutoka' : 'Confirm Logout',
      message:
        language === 'sw'
          ? 'Je, una uhakika unataka kutoka?'
          : 'Are you sure you want to logout?',
      confirmLabel: language === 'sw' ? 'Ondoka' : 'Logout',
      cancelLabel: language === 'sw' ? 'Ghairi' : 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await AsyncStorage.setItem('language', language);
      await logoutUser();
      router.replace({
        pathname: '/auth/login',
        params: { lang: language },
      });
    } catch (e: any) {
      showError(
        e.message ||
          (language === 'sw'
            ? 'Imeshindwa kutoka. Tafadhali jaribu tena.'
            : 'Failed to logout. Please try again.')
      );
    }
  }

  const menuItems: MenuItem[] = [
    {
      id: 'language',
      iconType: 'ionicons',
      iconName: 'language',
      label: 'Change Language',
      labelSw: 'Badilisha Lugha',
      onPress: () => router.push({ pathname: '/tabs/user-profile/language', params: { lang: language, userId } }),
    },
    {
      id: 'notifications',
      iconType: 'ionicons',
      iconName: 'notifications',
      label: 'Notifications',
      labelSw: 'Taarifa',
      onPress: () => router.push({ pathname: '/tabs/user-profile/notifications', params: { lang: language, userId } }),
    },
    {
      id: 'pin',
      iconType: 'ionicons',
      iconName: 'lock-closed',
      label: 'Change PIN',
      labelSw: 'Badilisha PIN',
      onPress: () => router.push({ pathname: '/tabs/user-profile/change-pin', params: { lang: language, userId } }),
    },
    {
      id: 'profile',
      iconType: 'ionicons',
      iconName: 'create-outline',
      label: 'Update Personal Info',
      labelSw: 'Sasisha Taarifa za Yangu',
      onPress: () => router.push({ pathname: '/tabs/user-profile/updating-personal-info', params: { lang: language, userId } }),
    },
    {
      id: 'cycle',
      iconType: 'ionicons',
      iconName: 'calendar',
      label: 'Update Cycle Info',
      labelSw: 'Sasisha Taarifa za Mzunguko',
      onPress: () => router.push({ pathname: '/tabs/log-entry', params: { lang: language, userId } }),
    },
    {
      id: 'delete',
      iconType: 'material',
      iconName: 'person-remove',
      label: 'Delete Account',
      labelSw: 'Futa Akaunti',
      onPress: () => router.push({ pathname: '/tabs/user-profile/delete-account', params: { lang: language, userId } }),
    },
    {
      id: 'logout',
      iconType: 'ionicons',
      iconName: 'exit-outline',
      label: 'Logout',
      labelSw: 'Toka',
      onPress: handleLogout,
      isDanger: true,
    },
  ];


  const renderIcon = (item: MenuItem) => {
    const iconColor = colors.brand.base;
    const iconSize = 22;

    if (item.id === 'logout' && isLoggingOut) {
      return <ActivityIndicator size="small" color={iconColor} />;
    }

    switch (item.iconType) {
      case 'material':
        return <MaterialIcons name={item.iconName as any} size={iconSize} color={iconColor} />;
      case 'fontawesome':
        return <FontAwesome5 name={item.iconName as any} size={iconSize} color={iconColor} />;
      case 'ionicons':
      default:
        return <Ionicons name={item.iconName as any} size={iconSize} color={iconColor} />;
    }
  };

  if (isInitialFetching && !user) {
    return (
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.brand.base} />
          <Text style={{ marginTop: 16, color: colors.text.secondary, ...typography.body }}>
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </Text>
        </View>
    );
  }

  if (error && !user) {
    return (
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.state.error, ...typography.body, textAlign: 'center', marginBottom: 16 }}>
            {language === 'sw' ? 'Hitilafu: ' : 'Error: '}
            {error}
          </Text>
          <TouchableOpacity onPress={() => refetchUser(true)}>
            <Text style={{ color: colors.brand.text, fontWeight: '700' }}>
              {language === 'sw' ? 'Jaribu tena' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {isBackgroundFetching && (
            <View style={{ position: 'absolute', top: insets.top + 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
              <ActivityIndicator size="small" color={colors.brand.base} />
            </View>
        )}

        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>{language === 'sw' ? 'Wasifu' : 'Profile'}</Text>
        </View>

        <ScrollView
            // UIKit already insets scroll content for the tab bar; this is the
            // cross-platform backstop so the last card clears it on Android too.
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: tabInset }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  // isInitialFetching is query.isLoading, which is only true
                  // on the very first load with no cached data — so after the
                  // first visit the spinner never appeared and the pull looked
                  // like it did nothing. isBackgroundFetching is the refetch.
                  refreshing={isBackgroundFetching}
                  onRefresh={handleRefresh}
                  tintColor={colors.brand.base}
                  colors={[colors.brand.base]}
              />
            }
        >
          <NUICard style={styles.profileCard} padded={false}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={36} color={colors.brand.base} />
              </View>
            </View>
            <Text style={styles.userName}>
              {user?.kv?.first_name || (language === 'sw' ? 'Mgeni' : 'Guest')}{' '}
              {user?.kv?.last_name || ''}
            </Text>
            <Text style={styles.memberSince}>
              {language === 'sw' ? 'Mwanachama tangu' : 'Member since'} {memberSince}
            </Text>
          </NUICard>

          <NUICard style={styles.menuContainer} padded={false}>
            {menuItems.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                    onPress={item.onPress}
                    disabled={item.id === 'logout' && isLoggingOut}
                    accessibilityLabel={language === 'sw' ? item.labelSw : item.label}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconContainer}>{renderIcon(item)}</View>
                    <Text style={[styles.menuLabel, item.isDanger && styles.dangerText]}>
                      {language === 'sw' ? item.labelSw : item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
            ))}
          </NUICard>
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
    // A tab root has no parent to go back to, so the back button that used to
    // sit here was always a no-op and has been removed; the title centres on
    // its own rather than being spread by space-between.
    justifyContent: 'center',
    paddingHorizontal: 16,
    // The title sits in a bar of its own, matching the platform header that
    // every pushed screen now uses. Without it the top of a tab root was bare
    // canvas, so moving from Profile into Change PIN flipped the top band from
    // grey to white. The safe-area inset is applied inline so the bar runs
    // behind the status bar rather than starting below it.
    backgroundColor: colors.surface.card,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    display: 'flex',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface.app,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  memberSince: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  menuContainer: {
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface.app,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dangerText: {
    color: colors.state.error,
  },
});