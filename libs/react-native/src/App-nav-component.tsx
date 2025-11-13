import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

interface Props {
  language: 'en' | 'sw';
  userId: string;
}

export const NavbarCard: React.FC<Props> = ({ language, userId }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const handleHomePress = () => {
    router.push({
      pathname: '/tabs/HomeScreen',
      params: {
        lang: language,
        userId: userId,
      },
    });
  };

  const handleCalendarPress = () => {
    router.push({
      pathname: '/tabs/CalenderScreen',
      params: {
        lang: language,
        userId: userId,
      },
    });
  };

  const handleAddPress = () => {
    router.push({
      pathname: '/tabs/LogEntryScreen',
      params: {
        lang: language,
        userId: userId,
      },
    });
  };

  const handleInsightsPress = () => {
    router.push({
      pathname: '/tabs/InsightsScreen',
      params: {
        lang: language,
        userId: userId,
      },
    });
  };

  const handleProfilePress = () => {
    router.push({
      pathname: '/tabs/UserProfileScreen',
      params: {
        lang: language,
        userId: userId,
      },
    });
  };

  // Helper function to check if a route is active
  const isActive = (route: string) => pathname?.includes(route);

  return (
    <View
      style={[
        styles.bottomNav,
        { paddingBottom: insets.bottom + 16 },
      ]}
    >
      <TouchableOpacity
        style={styles.navItem}
        accessibilityLabel={language === 'en' ? 'Home' : 'Nyumbani'}
        accessibilityRole="button"
        onPress={handleHomePress}
      >
        <Ionicons name="home" size={26} color="#FF4C7C" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        accessibilityLabel={language === 'en' ? 'Calendar' : 'Kalenda'}
        accessibilityRole="button"
        onPress={handleCalendarPress}
      >
        <Ionicons name="calendar-outline" size={28} color="#3EA310" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        accessibilityLabel={language === 'en' ? 'Add' : 'Ongeza'}
        accessibilityRole="button"
        onPress={handleAddPress}
      >
        <Ionicons name="add-circle" size={26} color="#CE2020" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        accessibilityLabel={language === 'en' ? 'Insights' : 'Maarifa'}
        accessibilityRole="button"
        onPress={handleInsightsPress}
      >
        <Ionicons name="bulb-sharp" size={26} color="#30B3EB" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        accessibilityLabel={language === 'en' ? 'Profile' : 'Wasifu'}
        accessibilityRole="button"
        onPress={handleProfilePress}
      >
        <View style={styles.userBadge}>
          <Ionicons name="person" size={22} color="#36558F" />
          <View style={styles.checkMark}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: '#CE2020',
    justifyContent: 'center',
    alignItems: 'center',
  },
});