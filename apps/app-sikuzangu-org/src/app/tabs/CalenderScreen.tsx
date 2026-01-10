import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavbarCard } from '@siku-zangu/react-native';
import { useUser } from '@siku-zangu/react';
import {
  calculateCycleData,
  formatDate,
  formatDateRange,
  getCircularCoordinates,
  getDaysInMonth,
  MONTH_NAMES_EN,
  MONTH_NAMES_SW,
} from '@siku-zangu/react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

const RADIUS = 120;
const CENTER_X = 180;
const CENTER_Y = 180;

export default function Calendar() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { user, refetchUser, isFetchingUser } = useUser(userId);
  const [selectedDay] = useState<number | null>(null);
  const lastFetchRef = useRef<number>(0);
  const STALE_TIME = 3 * 60 * 1000;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthNames = language === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_SW;

  useFocusEffect(
      useCallback(() => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchRef.current;
        const isStale = timeSinceLastFetch > STALE_TIME;

        if (userId && refetchUser && (!user || isStale)) {
          refetchUser(true);
          lastFetchRef.current = now;
        } else {
        }
      }, [userId, refetchUser, user])
  );
  const cycleData = useMemo(() => {
    if (!user?.kv?.prev_cycle_start_date) {
      return {
        periodDays: [],
        fertilityDays: [],
        ovulationDays: [],
        predictedDays: [],
        nextPeriodDate: new Date(currentYear, currentMonth + 1, 1),
        ovulationDate: new Date(currentYear, currentMonth, 15),
        daysUntilPeriod: 0,
        daysInMonth: getDaysInMonth(currentMonth, currentYear),
      };
    }
    return calculateCycleData(
        user.kv.prev_cycle_start_date,
        user.kv.avg_cycle_length_days || 28,
        user.kv.avg_period_length_days || 6,
        currentMonth,
        currentYear
    );
  }, [
    user?.kv?.prev_cycle_start_date,
    user?.kv?.avg_cycle_length_days,
    user?.kv?.avg_period_length_days,
    currentMonth,
    currentYear,
  ]);

  const {
    periodDays,
    fertilityDays,
    ovulationDays,
    predictedDays,
    ovulationDate,
    daysUntilPeriod,
    daysInMonth,
  } = cycleData;

  const handleBack = () => router.back();
  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      await refetchUser(true);
      lastFetchRef.current = Date.now();
    }
  }, [refetchUser]);
  const fertilityStart = new Date(
      ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000
  );
  const fertilityEnd = new Date(ovulationDate.getTime() + 24 * 60 * 60 * 1000);
  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Calendar' : 'Kalenda'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                  refreshing={isFetchingUser}
                  onRefresh={handleRefresh}
                  tintColor="#FF5C8D"
                  colors={['#FF5C8D']}
              />
            }
        >
          <View style={styles.card}>
            <Text style={styles.month}>
              {`${monthNames[currentMonth]} ${currentYear}`}
            </Text>
            <View style={styles.calendarContainer}>
              <Svg height="360" width="360">
                <SvgText
                    x={CENTER_X}
                    y={CENTER_Y}
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="600"
                    fill="#999"
                >
                  {monthNames[currentMonth].slice(0, 3)}
                </SvgText>

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const { x, y, angle } = getCircularCoordinates(
                      day,
                      daysInMonth,
                      RADIUS,
                      CENTER_X,
                      CENTER_Y
                  );
                  let fill = '#fff';
                  let stroke = '#e0e0e0';
                  let strokeDasharray: string | undefined = undefined;
                  let sequenceNum: number | null = null;

                  if (periodDays.includes(day)) {
                    fill = '#FF5E87';
                    stroke = '#FF5E87';
                    sequenceNum = periodDays.indexOf(day) + 1;
                  } else if (predictedDays.includes(day)) {
                    fill = '#fff';
                    stroke = '#FF5E87';
                    strokeDasharray = '4 4';
                    sequenceNum = predictedDays.indexOf(day) + 1;
                  } else if (ovulationDays.includes(day)) {
                    fill = '#D245D2';
                    stroke = '#D245D2';
                  } else if (fertilityDays.includes(day)) {
                    fill = '#27B3B3';
                    stroke = '#27B3B3';
                  }

                  const badgeRadius = RADIUS + 20;
                  const badgeX = CENTER_X + badgeRadius * Math.cos(angle);
                  const badgeY = CENTER_Y + badgeRadius * Math.sin(angle);

                  return (
                      <React.Fragment key={day}>
                        <Circle
                            cx={x}
                            cy={y}
                            r={selectedDay === day ? 19 : 16}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={selectedDay === day ? 3 : 2.5}
                            strokeDasharray={strokeDasharray}
                        />
                        <SvgText
                            x={x}
                            y={y + 5}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="500"
                            fill={fill === '#fff' ? '#333' : '#fff'}
                        >
                          {day}
                        </SvgText>
                        {sequenceNum && (
                            <>
                              <Circle
                                  cx={badgeX}
                                  cy={badgeY}
                                  r="8"
                                  fill={strokeDasharray ? '#fff' : stroke}
                                  stroke={stroke}
                                  strokeWidth="1.5"
                                  strokeDasharray={strokeDasharray}
                              />
                              <SvgText
                                  x={badgeX}
                                  y={badgeY + 3}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fontWeight="600"
                                  fill={strokeDasharray ? '#FF5E87' : '#fff'}
                              >
                                {sequenceNum}
                              </SvgText>
                            </>
                        )}
                      </React.Fragment>
                  );
                })}
              </Svg>
            </View>
            <View style={styles.legend}>
              <LegendItem
                  color="#FF5E87"
                  label={language === 'en' ? 'Period' : 'Hedhi'}
              />
              <LegendItem
                  color="#D245D2"
                  label={language === 'en' ? 'Ovulation' : 'Kupevuka kwa yai  '}
              />
              <LegendItem
                  color="#27B3B3"
                  label={language === 'en' ? 'Fertility' : 'Kipindi chenye uwezekano mkubwa wa kutunga mimba'}
              />
              <LegendItem
                  color="#FF5E87"
                  label={language === 'en' ? 'Predicted' : 'Imetabiriwa'}
                  dotted
              />
            </View>
          </View>
          <View style={styles.row}>
            <InfoCard
                title={language === 'en' ? 'Cycle Length' : 'Urefu wa Mzunguko wa Hedhi'}
                value={String(user?.kv?.avg_cycle_length_days || 28)}
                unit={language === 'en' ? 'days' : 'siku'}
                icon="calendar-outline"
                iconColor="#FF4C7C"
                graph
            />
            <InfoCard
                title={language === 'en' ? 'Next Period' : 'Hedhi Inayofuata'}
                value={
                  daysUntilPeriod === 0
                      ? language === 'en'
                          ? 'Today'
                          : 'Leo'
                      : language === 'en'
                          ? `in ${daysUntilPeriod} ${
                              daysUntilPeriod === 1 ? 'day' : 'days'
                          }`
                          : `baada ya siku ${daysUntilPeriod}`
                }
                icon="water-outline"
                iconColor="#1ABC9C"
            />
          </View>
          {user?.kv?.prev_cycle_start_date && (
              <>
                <PhaseCard
                    title={
                      language === 'en' ? 'Ovulation Phase' : 'Kipindi cha kupevuka kwa yai    '
                    }
                    date={
                      language === 'en'
                          ? `Expected on ${formatDate(ovulationDate, monthNames)}`
                          : `Kinatarajiwa tarehe ${formatDate(ovulationDate, monthNames)}`
                    }
                    description={
                      language === 'en'
                          ? 'Your body releases an egg — the most fertile day in your cycle.'
                          : 'Mwili wako huachilia yai – siku yenye nafasi kubwa zaidi ya mimba kutungwa katika mzunguko wako.'
                    }
                    color="#9B59B6"
                    icon="flower-outline"
                />
                <PhaseCard
                    title={
                      language === 'en' ? 'Fertility Window' : 'Kipindi chenye uwezekano mkubwa wa kutunga mimba'
                    }
                    date={formatDateRange(fertilityStart, fertilityEnd, monthNames)}
                    description={
                      language === 'en'
                          ? 'Best chance of getting pregnant during this window.'
                          : 'Uwezekano mkubwa wa kutunga mimba'
                    }
                    color="#1ABC9C"
                    icon="sparkles-outline"
                />
              </>
          )}
          {!user?.kv?.prev_cycle_start_date && (
              <View style={styles.emptyStateCard}>
                <Ionicons name="calendar-outline" size={48} color="#FF5C8D" />
                <Text style={styles.emptyStateTitle}>
                  {language === 'en'
                      ? 'No Cycle Data Yet'
                      : 'Hakuna Data ya Mzunguko'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {language === 'en'
                      ? 'Start logging your period to see predictions and insights.'
                      : 'Anza kurekodi hedhi yako ili kuona utabiri na maarifa.'}
                </Text>
              </View>
          )}
          <TouchableOpacity
              style={styles.trackingCard}
              activeOpacity={0.8}
              onPress={() =>
                  router.push({
                    pathname: '/tabs/LogEntryScreen',
                    params: { lang: language, userId: userId },
                  })
              }
              accessibilityLabel={
                language === 'en' ? 'Track Cycle' : 'Fuatilia Mzunguko'
              }
              accessibilityRole="button"
          >
            <View style={styles.trackingContent}>
              <View style={styles.bulbIcon}>
                <Ionicons name="bulb" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackingTitle}>
                  {language === 'en'
                      ? 'Track Your Cycle'
                      : 'Fuatilia Mzunguko Wako'}
                </Text>
                <Text style={styles.trackingText}>
                  {language === 'en'
                      ? 'Log your symptoms and moods'
                      : 'Rekodi dalili na hisia zako'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>

        <NavbarCard language={language} userId={userId} />
      </View>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  dotted?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, dotted }) => (
    <View style={styles.legendItem}>
      <View
          style={[
            styles.legendDot,
            {
              borderColor: color,
              borderStyle: dotted ? 'dashed' : 'solid',
              backgroundColor: dotted ? '#fff' : color,
            },
          ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
);

interface InfoCardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  graph?: boolean;
}
const InfoCard: React.FC<InfoCardProps> = ({
                                             title,
                                             value,
                                             unit,
                                             icon,
                                             iconColor,
                                             graph,
                                           }) => (
    <View style={styles.infoCard}>
      {icon && (
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
      )}
      <Text style={styles.cardTitle}>{title}</Text>
      {graph ? (
          <>
            <Text style={[styles.cycleValue, { color: iconColor }]}>{value}</Text>
            <Text style={styles.cycleUnit}>{unit}</Text>
            <View style={[styles.graphLine, { backgroundColor: iconColor }]} />
          </>
      ) : (
          <>
            <Text style={styles.nextPeriod}>{value}</Text>
            {icon && (
                <View style={styles.dropContainer}>
                  <Ionicons name="water" size={14} color={iconColor} />
                  <Ionicons name="water" size={14} color={iconColor} />
                  <Ionicons name="water" size={14} color={iconColor} />
                </View>
            )}
          </>
      )}
    </View>
);
interface PhaseCardProps {
  title: string;
  date: string;
  description: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}
const PhaseCard: React.FC<PhaseCardProps> = ({
                                               title,
                                               date,
                                               description,
                                               color,
                                               icon,
                                             }) => (
    <View style={styles.phaseCard}>
      <View style={[styles.phaseAccent, { backgroundColor: color }]} />
      <View style={styles.phaseHeader}>
        <View style={[styles.phaseIconBg, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.phaseTitle, { color }]}>{title}</Text>
      </View>
      <Text style={styles.phaseDate}>{date}</Text>
      <Text style={styles.phaseDesc}>{description}</Text>
    </View>
);
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  calendarContainer: {
    marginVertical: 8,
  },
  month: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    fontWeight: '500',
  },
  cycleValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  cycleUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  nextPeriod: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  dropContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 2,
  },
  graphLine: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  phaseAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  phaseDate: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  phaseDesc: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  trackingCard: {
    backgroundColor: '#FF4C7C',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 2,
  },
  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulbIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  trackingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});