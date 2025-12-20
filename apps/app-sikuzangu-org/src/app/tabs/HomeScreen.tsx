import React, { useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  calculateCycleMetrics,
  MONTH_NAMES_EN,
  getCyclePhaseInsight,
  getMoodConfig,
  getSymptomConfig,
  getMostRecentMood,
  getRecentSymptoms,
} from '@siku-zangu/react-native';
import { useUser } from '@siku-zangu/react';
import { NavbarCard } from '@siku-zangu/react-native';

const RING_RADIUS = 50;
const RING_STROKE = 10;

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { user, refetchUser, isFetchingUser } = useUser(userId);
  const lastFetchRef = useRef<number>(0);
  const STALE_TIME = 3 * 60 * 1000;
  const currentDate = new Date();

  useFocusEffect(
      useCallback(() => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchRef.current;
        const isStale = timeSinceLastFetch > STALE_TIME;
        if (userId && refetchUser && (!user || isStale)) {
          refetchUser();
          lastFetchRef.current = now;
        } else {
        }
      }, [userId, refetchUser, user])
  );
  const MOOD_CONFIG = useMemo(() => getMoodConfig(language), [language]);
  const SYMPTOM_CONFIG = useMemo(() => getSymptomConfig(language), [language]);
  const mostRecentMood = useMemo(
      () => getMostRecentMood(user?.kv?.mood_logs),
      [user?.kv?.mood_logs]
  );
  const recentSymptoms = useMemo(
      () => getRecentSymptoms(user?.kv?.symptom_logs, 3),
      [user?.kv?.symptom_logs]
  );
  const cycleMetrics = useMemo(
      () =>
          calculateCycleMetrics(
              user?.kv?.prev_cycle_start_date,
              user?.kv?.avg_cycle_length_days || 28
          ),
      [
        user?.kv?.prev_cycle_start_date,
        user?.kv?.avg_cycle_length_days,
        user?.kv?.avg_period_length_days,
      ]
  );
  const {
    daysUntilPeriod,
    ovulationDate,
    nextPeriodDate,
    daysUntilOvulation,
    fertileDaysRemaining,
    progress,
    dayInCycle,
  } = cycleMetrics;
  const todayInsight = useMemo(
      () =>
          getCyclePhaseInsight(
              dayInCycle,
              ovulationDate,
              user?.kv?.avg_period_length_days ?? 6,
              user?.kv?.avg_cycle_length_days ?? 28,
              language
          ),
      [
        dayInCycle,
        ovulationDate,
        user?.kv?.avg_period_length_days,
        user?.kv?.avg_cycle_length_days,
        language,
      ]
  );
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
    router.push({
      pathname: '/tabs/LogEntryScreen',
      params: { lang: language, userId: userId },
    });
  };
  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      console.log('🔄 Manual refresh triggered');
      await refetchUser();
      lastFetchRef.current = Date.now();
    }
  }, [refetchUser]);
  const moodData = mostRecentMood ? MOOD_CONFIG[mostRecentMood] : null;
  const remainingSymptoms =
      recentSymptoms.length > 3 ? recentSymptoms.length - 3 : 0;
  if (!user && isFetchingUser) {
    return (
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF5C8D" />
          <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </Text>
        </View>
    );
  }
  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  refreshing={isFetchingUser}
                  onRefresh={handleRefresh}
                  tintColor="#FF5C8D"
                  colors={['#FF5C8D']}
              />
            }
        >
          <LinearGradient
              colors={['#FD5A7E', '#FF7DAA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
          >
            <Text style={styles.greeting}>
              {language === 'sw' ? 'Habari' : 'Hi'},{' '}
              {user?.kv?.first_name || (language === 'sw' ? 'rafiki' : 'there')}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'sw'
                  ? 'Huu ni muhtasari wa mzunguko wako'
                  : "Here's your cycle overview"}
            </Text>
          </LinearGradient>
          <View style={styles.statsCard}>
            <Text style={[styles.statTitle]}>
              {language === 'sw' ? 'Muhtasari wa Mzunguko' : 'Cycle Overview'}
            </Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#FF597D' }]}>
                  {daysUntilPeriod}
                </Text>
                <Text style={styles.statLabel}>
                  {language === 'sw' ? 'Siku' : 'days'}
                </Text>
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Siku za hedhi zinazokuja' : 'Next period'}
                </Text>
                <Text style={styles.statDate}>{formattedNextPeriod}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#1DA8AD' }]}>
                  {daysUntilOvulation}
                </Text>
                <Text style={styles.statLabel}>
                  {language === 'sw' ? 'Siku' : 'days'}
                </Text>
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Kupevuka kwa yai kutatokea baada ya' : 'Ovulation'}
                </Text>
                <View style={styles.iconRow}>
                  <Ionicons name="moon" color="#555" size={12} />
                  <Text style={styles.statDate}>
                    {language === 'sw' ? 'Karibu' : 'Coming'}
                  </Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#A855F7' }]}>
                  {fertileDaysRemaining}
                </Text>
                <Text style={styles.statLabel}>
                  {language === 'sw' ? 'Siku' : 'days'}
                </Text>
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Kipindi chenye uwezekano mkubwa wa kutunga mimba' : 'Fertile'}
                </Text>
                <Text style={styles.statDate}>
                  {fertileDaysRemaining > 0
                      ? language === 'sw'
                          ? 'Nafasi'
                          : 'Active'
                      : language === 'sw'
                          ? 'Imepita'
                          : 'Passed'}
                </Text>
              </View>
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
                  transform={`rotate(-90 60 60)`}
              />
            </Svg>
            <Text style={styles.ringText}>{daysUntilPeriod}</Text>
            <Text style={styles.ringSubtext}>
              {language === 'sw' ? 'siku' : 'days'}
            </Text>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb-outline" size={22} color="#FFB703" />
              <Text style={styles.insightTitle}>
                {language === 'sw' ? 'Dondoo za leo' : "Today's Insight"} -{' '}
                {todayInsight.phase} {language === 'sw' ? 'Awamu' : 'Phase'}
              </Text>
            </View>
            <Text style={styles.insightText}>{todayInsight.text}</Text>
            <Text style={styles.cycleDayText}>
              {language === 'sw' ? 'Siku' : 'Day'} {dayInCycle}{' '}
              {language === 'sw' ? 'ya mzunguko' : 'of cycle'}
            </Text>
          </View>
          <View style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logTitle}>
                {language === 'sw' ? 'Rekodi ya Leo' : "Today's Log"}
              </Text>
              <TouchableOpacity onPress={handleAddLog}>
                <Ionicons name="create-outline" size={18} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.logDate}>{formattedToday}</Text>
            {moodData ? (
                <View style={styles.moodRow}>
                  <View style={styles.moodIcon}>
                    <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.moodText}>{moodData.label}</Text>
                    <Text style={styles.moodSub}>
                      {language === 'sw'
                          ? 'Hisia ya hivi karibuni'
                          : 'Most recent mood'}
                    </Text>
                  </View>
                </View>
            ) : (
                <TouchableOpacity style={styles.emptyMood} onPress={handleAddLog}>
                  <Ionicons name="happy-outline" size={20} color="#999" />
                  <Text style={styles.emptyText}>
                    {language === 'sw' ? 'Ongeza hisia yako' : 'Add your mood'}
                  </Text>
                </TouchableOpacity>
            )}
            {recentSymptoms.length > 0 ? (
                <>
                  <Text style={styles.symptomTitle}>
                    {language === 'sw'
                        ? 'Dalili za Hivi Karibuni'
                        : 'Recent Symptoms'}
                  </Text>
                  <View style={styles.symptomRow}>
                    {recentSymptoms.slice(0, 3).map((symptom) => {
                      const config = SYMPTOM_CONFIG[symptom];
                      if (!config) return null;

                      return (
                          <View key={symptom} style={styles.symptomCircle}>
                            <Ionicons
                                name={config.icon}
                                size={18}
                                color={config.color}
                            />
                            <Text style={styles.symptomLabel}>{config.label}</Text>
                          </View>
                      );
                    })}
                    {remainingSymptoms > 0 && (
                        <TouchableOpacity
                            style={styles.moreCircle}
                            onPress={handleAddLog}
                        >
                          <Text style={styles.moreText}>
                            +{remainingSymptoms}{' '}
                            {language === 'sw' ? 'zaidi' : 'more'}
                          </Text>
                        </TouchableOpacity>
                    )}
                  </View>
                </>
            ) : (
                <>
                  <Text style={styles.symptomTitle}>
                    {language === 'sw' ? 'Dalili' : 'Symptoms'}
                  </Text>
                  <TouchableOpacity
                      style={styles.emptySymptoms}
                      onPress={handleAddLog}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#999" />
                    <Text style={styles.emptyText}>
                      {language === 'sw' ? 'Ongeza dalili' : 'Add symptoms'}
                    </Text>
                  </TouchableOpacity>
                </>
            )}
          </View>
        </ScrollView>
        <NavbarCard language={language} userId={userId} />
      </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4EC',
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontStyle: 'normal',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    fontSize: 16,
    fontFamily: 'inter',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'inter',
  },
  statSub: {
    fontSize: 12,
    color: '#000',
    marginTop: 4,
    fontWeight: '600',
    fontFamily: 'inter',
  },
  statDate: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ringContainer: {
    alignSelf: 'center',
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontWeight: '700',
    fontSize: 22,
    color: '#FF5C8D',
  },
  ringSubtext: {
    position: 'absolute',
    top: 70,
    fontWeight: '500',
    fontSize: 12,
    color: '#FF5C8D',
  },
  insightCard: {
    backgroundColor: '#F8BBD0',
    marginHorizontal: 20,
    padding: 16,
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
    fontWeight: '600',
    color: '#333333',
    fontSize: 15,
    fontStyle: 'normal',
    flexShrink: 1,
  },
  insightText: {
    color: '#645F5F',
    lineHeight: 20,
    fontSize: 14,
    fontFamily: 'inter',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  cycleDayText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'inter',
  },
  logCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 15,
    elevation: 3,
    marginBottom: 100,
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
    fontSize: 16,
    color: '#333333',
    fontFamily: 'inter',
    fontStyle: 'normal',
  },
  logDate: {
    color: '#645F5F',
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'inter',
    fontStyle: 'normal',
    fontWeight: '500',
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
    fontWeight: '500',
    fontSize: 15,
    color: '#333',
    fontFamily: 'inter',
    fontStyle: 'normal',
  },
  moodSub: {
    color: '#645F5F',
    fontSize: 14,
    fontStyle: 'normal',
    fontFamily: 'inter',
    fontWeight: '400',
  },
  emptyMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    gap: 8,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'inter',
  },
  symptomTitle: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
    color: '#E66386',
    marginBottom: 10,
    fontFamily: 'inter',
    fontStyle: 'normal',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
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
  emptySymptoms: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    gap: 8,
  },
});