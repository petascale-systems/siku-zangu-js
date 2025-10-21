import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { calculateCycleData, MONTH_NAMES_EN } from '../utils/cycleCalculations';
import { useAccessToken } from '@siku-zangu/react';
import { NavbarCard } from '../components/App-nav-component';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const RING_RADIUS = 50;
const RING_STROKE = 10;

export const HomeScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const { user } = useAccessToken();
  const insets = useSafeAreaInsets();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const cycleData = useMemo(() => {
    if (!user?.kv?.prev_cycle_start_date) {
      return {
        daysUntilPeriod: 6,
        ovulationDate: new Date(2025, 9, 10),
        nextPeriodDate: new Date(2025, 9, 24),
        cycleLength: 28,
        progress: 0.75,
        daysUntilOvulation: 12,
        fertileDaysRemaining: 8,
      };
    }

    const data = calculateCycleData(
      user.kv.prev_cycle_start_date,
      user.kv.avg_cycle_length_days || 28,
      user.kv.avg_period_length_days || 5,
      currentMonth,
      currentYear
    );

    const cycleLength = user.kv.avg_cycle_length_days || 28;
    const daysUntilPeriod = data.daysUntilPeriod ?? 0;
    const daysPassed = Math.max(0, cycleLength - daysUntilPeriod);
    const progress = Math.min(daysPassed / cycleLength, 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilOvulation = Math.max(
      0,
      Math.ceil(
        (data.ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const fertileDaysRemaining = data.fertilityDays.filter(
      (day) => day >= today.getDate()
    ).length;

    return {
      daysUntilPeriod,
      ovulationDate: data.ovulationDate,
      nextPeriodDate: data.nextPeriodDate,
      cycleLength,
      progress,
      daysUntilOvulation,
      fertileDaysRemaining,
    };
  }, [user, currentMonth, currentYear]);

  const {
    daysUntilPeriod,
    ovulationDate,
    nextPeriodDate,
    daysUntilOvulation,
    fertileDaysRemaining,
    progress,
  } = cycleData;

  const formattedNextPeriod = `${MONTH_NAMES_EN[
    nextPeriodDate.getMonth()
  ].slice(0, 3)} ${nextPeriodDate.getDate()}`;
  const formattedToday = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const circumference = 2 * Math.PI * RING_RADIUS;
  const strokeDashoffset = circumference * (1 - progress);

  const handleAddLog = () => {
    // Navigate to log entry screen
    // navigation.navigate('AddLog');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF5C8D', '#FF7DAA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.greeting}>
            Hi, {user?.kv?.first_name || 'there'}
          </Text>
          <Text style={styles.subtitle}>Here's your cycle overview</Text>
        </LinearGradient>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#FF5C8D' }]}>
              {daysUntilPeriod}
            </Text>
            <Text style={styles.statLabel}>Next period</Text>
            <Text style={styles.statSub}>Starts: {formattedNextPeriod}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#28C2A0' }]}>
              {daysUntilOvulation}
            </Text>
            <Text style={styles.statLabel}>Ovulation in</Text>
            <View style={styles.iconRow}>
              <Ionicons name="moon" color="#555" size={14} />
              <Text style={styles.statSub}>{fertileDaysRemaining}-days</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#A36AFF' }]}>
              {fertileDaysRemaining}
            </Text>
            <Text style={styles.statLabel}>Fertile window</Text>
            <Text style={styles.statSub}>
              {fertileDaysRemaining > 0 ? 'High chance' : 'Passed'}
            </Text>
          </View>
        </View>
        <View style={styles.ringContainer}>
          <Svg height="120" width="120">
            <Circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              stroke="#FFD5E5"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              stroke="#FF5C8D"
              strokeWidth={RING_STROKE}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Text style={styles.ringText}>{daysUntilPeriod} days</Text>
        </View>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={22} color="#FFB703" />
            <Text style={styles.insightTitle}>Today's Insight</Text>
          </View>
          <Text style={styles.insightText}>
            You're in your luteal phase. Stay hydrated and eat iron-rich foods.
          </Text>
        </View>
        <View style={styles.logCard}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>Today's Log</Text>
            <TouchableOpacity onPress={handleAddLog}>
              <Ionicons name="create-outline" size={18} color="#555" />
            </TouchableOpacity>
          </View>

          <Text style={styles.logDate}>{formattedToday}</Text>

          <View style={styles.moodRow}>
            <View style={styles.moodIcon}>
              <Text style={styles.moodEmoji}>😊</Text>
            </View>
            <View>
              <Text style={styles.moodText}>Happy</Text>
              <Text style={styles.moodSub}>Logged at 9:20 AM</Text>
            </View>
          </View>
          <Text style={styles.symptomTitle}>Symptoms</Text>
          <View style={styles.symptomRow}>
            <View style={styles.symptomCircle}>
              <Ionicons name="flash-outline" size={18} color="#8B5CF6" />
              <Text style={styles.symptomLabel}>Fatigue</Text>
            </View>
            <View style={styles.symptomCircle}>
              <Ionicons name="body-outline" size={18} color="#F59E0B" />
              <Text style={styles.symptomLabel}>Cramps</Text>
            </View>
            <TouchableOpacity style={styles.moreCircle} onPress={handleAddLog}>
              <Text style={styles.moreText}>+2 more</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <NavbarCard navigation={navigation} language={language} userId={userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F9',
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  statBox: {
    backgroundColor: '#fff',
    width: '30%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF5C8D',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 3,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ringContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontWeight: '700',
    fontSize: 16,
    color: '#FF5C8D',
  },
  insightCard: {
    backgroundColor: '#FFD5E5',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightTitle: {
    fontWeight: '700',
    color: '#444',
    fontSize: 15,
  },
  insightText: {
    color: '#555',
    lineHeight: 20,
  },
  logCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    marginBottom: 30,
    shadowColor: '#FF5C8D',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  logDate: {
    color: '#888',
    marginTop: 4,
    fontSize: 12,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  moodIcon: {
    backgroundColor: '#FFE4EC',
    borderRadius: 50,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodText: {
    fontWeight: '600',
    fontSize: 15,
  },
  moodSub: {
    color: '#777',
    fontSize: 12,
  },
  symptomTitle: {
    marginTop: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symptomCircle: {
    backgroundColor: '#F6F0FF',
    borderRadius: 50,
    padding: 8,
    alignItems: 'center',
    width: 70,
  },
  symptomLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#444',
  },
  moreCircle: {
    backgroundColor: '#FFD5E5',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  moreText: {
    color: '#444',
    fontSize: 11,
    fontWeight: '600',
  },
});
