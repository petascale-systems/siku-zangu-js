import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessToken, useUser } from '@siku-zangu/react';
import { NavbarCard } from '@siku-zangu/react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthProtection } from '@siku-zangu/react-native';

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
  useAuthProtection(true);

  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { user, refetchUser, isInitialFetching, isBackgroundFetching, error } = useUser(userId);
  const { logoutUser, isLoggingOut } = useAccessToken();
  const lastFetchRef = useRef<number>(0);
  const MIN_DELAY_BETWEEN_REFRESHES = 30000;

  useFocusEffect(
      useCallback(() => {
        if (!userId || !refetchUser) return;
        const now = Date.now();
        if (now - lastFetchRef.current > MIN_DELAY_BETWEEN_REFRESHES) {
          refetchUser(true);
          lastFetchRef.current = now;
        }
      }, [userId, refetchUser])
  );

  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      await refetchUser(true);
      lastFetchRef.current = Date.now();
    }
  }, [refetchUser]);

  const memberSince = user?.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Aug 2025';

  function handleLogout() {
    Alert.alert(
        language === 'sw' ? 'Thibitisha Kutoka' : 'Confirm Logout',
        language === 'sw' ? 'Je, una uhakika unataka kutoka?' : 'Are you sure you want to logout?',
        [
          { text: language === 'sw' ? 'Ghairi' : 'Cancel', style: 'cancel' },
          {
            text: language === 'sw' ? 'Ondoka' : 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                // Save language preference before logout
                await AsyncStorage.setItem('language', language);

                // Perform logout - this clears the access token
                await logoutUser();

                // Navigate to login screen using replace to clear navigation stack
                // This should prevent back navigation
                router.replace('/auth/LoginScreen');

              } catch (e: any) {
                Alert.alert(
                    language === 'sw' ? 'Hitilafu' : 'Error',
                    e.message || (language === 'sw' ? 'Imeshindwa kutoka. Tafadhali jaribu tena.' : 'Failed to logout. Please try again.')
                );
              }
            },
          },
        ]
    );
  }

  const menuItems: MenuItem[] = [
    {
      id: 'language',
      iconType: 'ionicons',
      iconName: 'language',
      label: 'Change Language',
      labelSw: 'Badilisha Lugha',
      onPress: () => router.push({ pathname: '/LanguageScreen', params: { lang: language, userId } }),
    },
    {
      id: 'notifications',
      iconType: 'ionicons',
      iconName: 'notifications',
      label: 'Notifications',
      labelSw: 'Taarifa',
      onPress: () => router.push({ pathname: 'tabs/NotificationsScreen', params: { lang: language, userId } }),
    },
    {
      id: 'pin',
      iconType: 'ionicons',
      iconName: 'lock-closed',
      label: 'Change PIN',
      labelSw: 'Badilisha PIN',
      onPress: () => router.push({ pathname: 'tabs/ChangePinScreen', params: { lang: language, userId } }),
    },
    {
      id: 'profile',
      iconType: 'ionicons',
      iconName: 'create-outline',
      label: 'Update Personal Info',
      labelSw: 'Sasisha Taarifa za Yangu',
      onPress: () => router.push({ pathname: 'tabs/UpdatingPersonalInfoScreen', params: { lang: language, userId } }),
    },
    {
      id: 'cycle',
      iconType: 'ionicons',
      iconName: 'calendar',
      label: 'Update Cycle Info',
      labelSw: 'Sasisha Taarifa za Mzunguko',
      onPress: () => router.push({ pathname: 'tabs/LogEntryScreen', params: { lang: language, userId } }),
    },
    {
      id: 'delete',
      iconType: 'material',
      iconName: 'person-remove',
      label: 'Delete Account',
      labelSw: 'Futa Akaunti',
      onPress: () => router.push({ pathname: 'tabs/DeleteAccountScreen', params: { lang: language, userId } }),
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

  const handleBack = () => router.back();

  const renderIcon = (item: MenuItem) => {
    const iconColor = '#FF597D';
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
          <ActivityIndicator size="large" color="#FF5C8D" />
          <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </Text>
        </View>
    );
  }

  if (error && !user) {
    return (
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#E66386', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
            {language === 'sw' ? 'Hitilafu: ' : 'Error: '}
            {error}
          </Text>
          <TouchableOpacity onPress={() => refetchUser(true)}>
            <Text style={{ color: '#FF597D', fontWeight: 'bold' }}>
              {language === 'sw' ? 'Jaribu tena' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isBackgroundFetching && (
            <View style={{ position: 'absolute', top: insets.top + 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
              <ActivityIndicator size="small" color="#FF5C8D" />
            </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'sw' ? 'Wasifu' : 'Profile'}</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  refreshing={isInitialFetching}
                  onRefresh={handleRefresh}
                  tintColor="#FF5C8D"
                  colors={['#FF5C8D']}
              />
            }
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={36} color="#FF597D" />
              </View>
            </View>
            <Text style={styles.userName}>
              {user?.kv?.first_name || (language === 'sw' ? 'Mgeni' : 'Guest')}{' '}
              {user?.kv?.last_name || ''}
            </Text>
            <Text style={styles.memberSince}>
              {language === 'sw' ? 'Mwanachama tangu' : 'Member since'} {memberSince}
            </Text>
          </View>

          <View style={styles.menuContainer}>
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
          </View>
        </ScrollView>

        <NavbarCard language={language} userId={userId} />
      </View>
  );
}

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
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
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
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  memberSince: {
    fontSize: 14,
    color: '#645F5F',
    fontFamily: 'inter',
    fontWeight: '400',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    backgroundColor: '#FFF4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    fontFamily: 'inter',
  },
  dangerText: {
    color: '#FF597D',
  },
});