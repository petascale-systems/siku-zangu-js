import React, { useMemo, useState, useCallback } from 'react';
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
import {
  MAX_FONT_SCALE,
  NUICyclePredictionSources,
  colors,
  typography,
  useLanguage,
  useSession,
  useTabContentInset,
  useTranslate,
  PAGE_BOTTOM_PADDING,
  NUICard
} from '@siku-zangu/expo';
import {useUser} from '@siku-zangu/react-native';
import {calculateCycleData, formatDate, formatDateRange, getCircularCoordinates, getDaysInMonth, MONTH_NAMES_EN, MONTH_NAMES_SW} from '@siku-zangu/expo';
import {useRouter, useFocusEffect} from 'expo-router';

const RADIUS = 120;
const CENTER_X = 180;
const CENTER_Y = 180;

export default function Calendar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  // From the session store, not the route params: the native tab navigator
  // switches tabs without params, so params.userId was undefined on every tab
  // except the one that was navigated to directly.
  const { userId } = useSession();
  const tabInset = useTabContentInset();
  const { user, userUpdatedAt, refetchUser, isFetchingUser } = useUser(userId);
  const [selectedDay] = useState<number | null>(null);
  const STALE_TIME = 3 * 60 * 1000;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthNames = language === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_SW;

  useFocusEffect(
      useCallback(() => {
        // Only a genuine revisit refetches. The initial load already owns the
        // first fetch, and staleness is measured against when the data actually
        // arrived — the old `useRef(0)` read as infinitely stale on the very
        // first focus, so a background refetch fired on top of the initial load
        // and the screen showed two loading states in a row.
        if (!userId || !refetchUser || !user) return;
        if (Date.now() - userUpdatedAt < STALE_TIME) return;
        refetchUser(true);
      }, [userId, refetchUser, user, userUpdatedAt])
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

  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      await refetchUser(true);
    }
  }, [refetchUser]);
  const fertilityStart = new Date(
      ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000
  );
  const fertilityEnd = new Date(ovulationDate.getTime() + 24 * 60 * 60 * 1000);
  return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>
            {t('calendar.calendar')}
          </Text>
        </View>

        <ScrollView
            // UIKit already insets scroll content for the tab bar; this is the
            // cross-platform backstop so the last card clears it on Android too.
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInset }]}
            refreshControl={
              <RefreshControl
                  refreshing={isFetchingUser}
                  onRefresh={handleRefresh}
                  tintColor="#FF5C8D"
                  colors={['#FF5C8D']}
              />
            }
        >
          <NUICard style={styles.card}>
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
                  label={t('calendar.period')}
              />
              <LegendItem
                  color="#D245D2"
                  label={t('calendar.ovulation')}
              />
              <LegendItem
                  color="#27B3B3"
                  label={t('calendar.fertility')}
              />
              <LegendItem
                  color="#FF5E87"
                  label={t('calendar.predicted')}
                  dotted
              />
            </View>
          </NUICard>
          <View style={styles.row}>
            <InfoCard
                title={t('calendar.cycleLength')}
                value={language === 'sw'
                  ? `Siku ${user?.kv?.avg_cycle_length_days || 28}`
                  : String(user?.kv?.avg_cycle_length_days || 28)}
                unit={language === 'en' ? 'days' : undefined}
                icon="calendar-outline"
                iconColor="#FF4C7C"
                graph
            />
            <InfoCard
                title={t('calendar.nextPeriod')}
                value={
                  daysUntilPeriod === 0
                      ? t('calendar.today')
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
                      t('calendar.ovulationPhase')
                    }
                    date={
                      language === 'en'
                          ? `Expected on ${formatDate(ovulationDate, monthNames)}`
                          : `Kinatarajiwa tarehe ${formatDate(ovulationDate, monthNames)}`
                    }
                    description={
                      t('calendar.yourBodyReleasesAnEgg')
                    }
                    color="#9B59B6"
                    icon="flower-outline"
                />
                <PhaseCard
                    title={
                      t('calendar.fertilityWindow')
                    }
                    date={formatDateRange(fertilityStart, fertilityEnd, monthNames)}
                    description={
                      t('calendar.bestChanceOfGettingPregnant')
                    }
                    color="#1ABC9C"
                    icon="sparkles-outline"
                />
              </>
          )}
          {!user?.kv?.prev_cycle_start_date && (
              <NUICard style={styles.emptyStateCard} padded={false}>
                <Ionicons name="calendar-outline" size={48} color="#FF5C8D" />
                <Text style={styles.emptyStateTitle}>
                  {t('calendar.noCycleDataYet')}
                </Text>
                <Text style={styles.emptyStateText}>
                  {t('calendar.startLoggingYourPeriodTo')}
                </Text>
              </NUICard>
          )}
          <TouchableOpacity
              style={styles.trackingCard}
              activeOpacity={0.8}
              onPress={() =>
                  router.push({
                    pathname: '/tabs/log-entry',
                    params: { lang: language, userId: userId },
                  })
              }
              accessibilityLabel={
                t('calendar.trackCycle')
              }
              accessibilityRole="button"
          >
            <View style={styles.trackingContent}>
              <View style={styles.bulbIcon}>
                <Ionicons name="bulb" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackingTitle}>
                  {t('calendar.trackYourCycle')}
                </Text>
                <Text style={styles.trackingText}>
                  {t('calendar.logYourSymptomsAndMoods')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <NUICyclePredictionSources language={language} variant="inline" />
        </ScrollView>
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
    <NUICard style={styles.infoCard}>
      {icon && (
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
      )}
      <Text style={styles.cardTitle}>{title}</Text>
      {graph ? (
          <>
            <Text style={[styles.cycleValue, { color: iconColor }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{value}</Text>
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
    </NUICard>
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
    <NUICard style={styles.phaseCard}>
      <View style={[styles.phaseAccent, { backgroundColor: color }]} />
      <View style={styles.phaseHeader}>
        <View style={[styles.phaseIconBg, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.phaseTitle, { color }]}>{title}</Text>
      </View>
      <Text style={styles.phaseDate}>{date}</Text>
      <Text style={styles.phaseDesc}>{description}</Text>
    </NUICard>
);
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  card: {
    alignItems: 'center',
    marginVertical: 10,
  },
  calendarContainer: {
    marginVertical: 8,
  },
  month: {
    ...typography.heading,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text.primary,
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
    ...typography.caption,
    color: colors.text.primary,
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
    alignItems: 'center',
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
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 6,
    fontWeight: '500',
  },
  cycleValue: {
    ...typography.displaySm,
    fontWeight: '700',
  },
  cycleUnit: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.muted,
    marginTop: 2,
  },
  nextPeriod: {
    ...typography.body,
    color: colors.text.primary,
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
    marginVertical: 10,
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
    ...typography.body,
    fontWeight: '700',
  },
  phaseDate: {
    ...typography.label,
    color: colors.text.muted,
    marginBottom: 6,
    fontWeight: '500',
  },
  phaseDesc: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyStateCard: {
    padding: 32,
    marginVertical: 10,
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...typography.headingSm,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: colors.brand.base,
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    ...typography.body,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: 2,
  },
  trackingText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});