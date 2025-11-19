import React from 'react';
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
import { useAccessToken } from '@siku-zangu/react';
import { NavbarCard } from '@siku-zangu/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface MenuItem {
  id: string;
  icon: string;
  emoji?: string;
  label: string;
  labelSw: string;
  onPress?: () => void;
  isDanger?: boolean;
}

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { user, logoutUser, isLoggingOut } = useAccessToken();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
    : 'Aug 2025';

  function handleLogout() {
    Alert.alert(
      language === 'sw' ? 'Thibitisha Kutoka' : 'Confirm Logout',
      language === 'sw'
        ? 'Je, una uhakika unataka kutoka?'
        : 'Are you sure you want to logout?',
      [
        {
          text: language === 'sw' ? 'Ghairi' : 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'sw' ? 'Ondoka' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              router.replace('/auth/LoginScreen');
            } catch (e: any) {
              Alert.alert(
                language === 'sw' ? 'Hitilafu' : 'Error',
                e.message ||
                (language === 'sw'
                  ? 'Imeshindwa kutoka. Tafadhali jaribu tena.'
                  : 'Failed to logout. Please try again.')
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
      icon: '🔄',
      label: 'Change Language',
      labelSw: 'Badilisha Lugha',
      onPress: () => router.push('/'),
    },
    {
      id: 'notifications',
      icon: '🔔',
      label: 'Notifications',
      labelSw: 'Arifa',
      onPress: () =>
        router.push({
          pathname: 'tabs/NotificationsScreen',
          params: { lang: language, userId },
        }),
    },
    {
      id: 'pin',
      icon: '🔒',
      label: 'Change PIN',
      labelSw: 'Badilisha PIN',
      onPress: () =>
        router.push({
          pathname: 'tabs/ChangePinScreen',
          params: { lang: language, userId },
        }),
    },
    {
      id: 'cycle',
      icon: '📅',
      label: 'Update Cycle Info',
      labelSw: 'Sasisha Taarifa za Mzunguko',
      onPress: () =>
        router.push({
          pathname: 'tabs/LogEntryScreen',
          params: { lang: language, userId },
        }),
    },
    {
      id: 'delete',
      icon: '👤',
      label: 'Delete Account',
      labelSw: 'Futa Akaunti',
      onPress: () =>
        router.push({
          pathname: 'tabs/DeleteAccountScreen',
          params: { lang: language, userId },
        }),
    },
    {
      id: 'logout',
      icon: 'exit-outline',
      label: 'Logout',
      labelSw: 'Ondoka',
      onPress: handleLogout,
      isDanger: true,
    },
  ];

  const handleBack = () => router.back();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👩</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.kv?.first_name || 'Guest'} {user?.kv?.last_name || ''}
          </Text>
          <Text style={styles.memberSince}>
            {language === 'sw' ? 'Mwanachama tangu' : 'Member since'}{' '}
            {memberSince}
          </Text>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              disabled={item.id === 'logout' && isLoggingOut}
            >
              <View style={styles.menuLeft}>
                {item.icon === 'exit-outline' ? (
                  <View style={styles.iconContainer}>
                    {isLoggingOut && item.id === 'logout' ? (
                      <ActivityIndicator size="small" color="#FF597D" />
                    ) : (
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color="#FF597D"
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <Text style={styles.menuEmoji}>{item.icon}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.menuLabel,
                    item.isDanger && styles.dangerText,
                  ]}
                >
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
  avatarEmoji: {
    fontSize: 36,
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
    marginBottom: 30,
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
  menuEmoji: {
    fontSize: 20,
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