import React, { useMemo, useCallback } from 'react';
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
import {useRouter, useFocusEffect} from 'expo-router';
import {
  MAX_FONT_SCALE,
  MONTH_NAMES_EN,
  NUICyclePredictionSources,
  calculateCycleMetrics,
  colors,
  formatRelativeLogDate,
  getCyclePhaseInsight,
  getLastLoggedValues,
  getMoodConfig,
  getMostRecentLogTimestamp,
  getMostRecentMoodLog,
  getSymptomConfig,
  radius,
  typography,
  useLanguage,
  useSession,
  useTabContentInset,
  useTranslate,
  NUIPressable,
  NUICard
} from '@siku-zangu/expo';
import {useUser} from '@siku-zangu/react-native';

const RING_RADIUS = 50;
const RING_STROKE = 10;
/** Moods and symptoms each show at most this many, then a "+N more". */
const LOG_PREVIEW_LIMIT = 3;

export default function Dashboard() {
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
  const { user, userUpdatedAt, refetchUser, isInitialFetching, isBackgroundFetching, error, isFetchingUser } = useUser(userId);
  const STALE_TIME = 3 * 60 * 1000;
  const currentDate = new Date();

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

  const MOOD_CONFIG = useMemo(() => getMoodConfig(language), [language]);
  const SYMPTOM_CONFIG = useMemo(() => getSymptomConfig(language), [language]);

  // The current selections, maintained server-side from each submission.
  //
  // Falls back to deriving them from the log entries when `selected_*` is
  // absent: only the server that appends logs also maintains those fields, so
  // an account that predates it — or an app talking to an API that has not been
  // deployed yet — would otherwise show nothing here no matter what was logged.
  // `?? `, not `||`: an empty array is a real answer ("I cleared these") and
  // must not fall through to the log entries.
  //
  // A submission is the complete set for that moment, so `selected_*` already
  // says exactly what the user last reported, including an empty set when they
  // cleared it. Deriving it from `*_logs` meant this screen had to guess at the
  // day boundary, and a cleared selection could not be represented at all.
  //
  // Still unfiltered by date on purpose: someone who opens the app occasionally
  // should see what they last logged, labelled with how long ago it was.
  const recentMoods = useMemo(
      () =>
          user?.kv?.selected_moods ??
          getLastLoggedValues(
              user?.kv?.mood_logs,
              (log: { mood: string }) => log.mood
          ),
      [user?.kv?.selected_moods, user?.kv?.mood_logs]
  );
  const recentSymptoms = useMemo(
      () =>
          user?.kv?.selected_symptoms ??
          getLastLoggedValues(
              user?.kv?.symptom_logs,
              (log: { symptom: string }) => log.symptom
          ),
      [user?.kv?.selected_symptoms, user?.kv?.symptom_logs]
  );

  // The log entries are still what dates the card — `selected_*` carries the
  // values, but not when they were reported.
  const mostRecentMoodLog = useMemo(
      () => getMostRecentMoodLog(user?.kv?.mood_logs),
      [user?.kv?.mood_logs]
  );

  const lastLogTimestamp = useMemo(
      () =>
          getMostRecentLogTimestamp(
              user?.kv?.mood_logs,
              user?.kv?.symptom_logs
          ),
      [user?.kv?.mood_logs, user?.kv?.symptom_logs]
  );

  const cycleMetrics = useMemo(
      () =>
          calculateCycleMetrics(
              user?.kv?.prev_cycle_start_date,
              user?.kv?.avg_cycle_length_days || 28
          ),
      [user?.kv?.prev_cycle_start_date, user?.kv?.avg_cycle_length_days]
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
      pathname: '/tabs/log-entry',
      params: { lang: language, userId: userId },
    });
  };

  const handleRefresh = useCallback(async () => {
    if (refetchUser) {
      await refetchUser(true);
    }
  }, [refetchUser]);

  const visibleSymptoms = recentSymptoms.slice(0, LOG_PREVIEW_LIMIT);
  const remainingSymptoms = recentSymptoms.length - visibleSymptoms.length;
  const visibleMoods = recentMoods.slice(0, LOG_PREVIEW_LIMIT);
  const remainingMoods = recentMoods.length - visibleMoods.length;

  // Falls back to today's date only for users who have never logged anything.
  const logDateLabel =
      formatRelativeLogDate(lastLogTimestamp, language) ?? formattedToday;
  // Mood and symptoms can come from different days, and the header shows the
  // newer of the two, so the mood row carries its own date.
  const moodDateLabel = formatRelativeLogDate(
      mostRecentMoodLog?.timestamp,
      language
  );

  if (!user && isInitialFetching) {
    return (
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF5C8D" />
          <Text style={{ marginTop: 16, color: colors.text.secondary, ...typography.body }}>
            {language === 'sw' ? 'Inapakia...' : 'Loading...'}
          </Text>
        </View>
    );
  }

  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isBackgroundFetching && (
            <View style={{ position: 'absolute', top: insets.top + 60, alignSelf: 'center' }}>
              <ActivityIndicator size="small" color="#FF5C8D" />
            </View>
        )}
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

          <NUICard style={styles.statsCard}>
            <Text style={[styles.statTitle]}>
              {language === 'sw' ? 'Muhtasari wa Mzunguko' : 'Cycle Overview'}
            </Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                {language === 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>Siku</Text>
                )}
                <Text style={[styles.statValue, { color: colors.brand.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {daysUntilPeriod}
                </Text>
                {language !== 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>days</Text>
                )}
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Hedhi ijayo' : 'Next period'}
                </Text>
                <Text style={styles.statDate}>{formattedNextPeriod}</Text>
              </View>
              <View style={styles.statItem}>
                {language === 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>Siku</Text>
                )}
                <Text style={[styles.statValue, { color: '#0F766E' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {daysUntilOvulation}
                </Text>
                {language !== 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>days</Text>
                )}
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Yai kupevuka' : 'Ovulation'}
                </Text>
                <View style={styles.iconRow}>
                  <Ionicons name="moon" color="#555" size={12} />
                  <Text style={styles.statDate}>
                    {language === 'sw' ? 'inakaribia' : 'Coming'}
                  </Text>
                </View>
              </View>
              <View style={styles.statItem}>
                {language === 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>Siku</Text>
                )}
                <Text style={[styles.statValue, { color: '#7E22CE' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {fertileDaysRemaining}
                </Text>
                {language !== 'sw' && (
                  <Text style={styles.statLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>days</Text>
                )}
                <Text style={styles.statSub}>
                  {language === 'sw' ? 'Dirisha la uzazi' : 'Fertile'}
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
          </NUICard>

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
            <Text style={styles.ringText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{daysUntilPeriod}</Text>
            <Text style={styles.ringSubtext} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {language === 'sw' ? 'siku' : 'days'}
            </Text>
          </View>
          <Text style={styles.ringDescription}>
            {daysUntilPeriod === 0
                ? language === 'sw'
                    ? 'Uko katika siku za hedhi'
                    : 'You are on your period'
                : fertileDaysRemaining > 0
                    ? language === 'sw'
                        ? `Dirisha la uzazi - siku ${fertileDaysRemaining} zimebaki`
                        : `Fertile window - ${fertileDaysRemaining} days remaining`
                    : daysUntilOvulation <= 3 && daysUntilOvulation > 0
                        ? language === 'sw'
                            ? `Yai kupevuka baada ya siku ${daysUntilOvulation}`
                            : `Ovulation in ${daysUntilOvulation} days`
                        : language === 'sw'
                            ? `Hedhi inatarajiwa baada ya siku ${daysUntilPeriod}`
                            : `Period expected in ${daysUntilPeriod} days`}
          </Text>
          <Text style={styles.ringCycleDay}>
            {language === 'sw'
                ? `Siku ${dayInCycle} ya ${user?.kv?.avg_cycle_length_days ?? 28}`
                : `Day ${dayInCycle} of ${user?.kv?.avg_cycle_length_days ?? 28}`}
          </Text>

          <View style={styles.sourcesRow}>
            <NUICyclePredictionSources language={language} variant="link" />
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb-outline" size={22} color="#D97706" />
              <Text style={styles.insightTitle} numberOfLines={2}>
                {language === 'sw' ? 'Dondoo za leo' : "Today's Insight"} -{' '}
                {todayInsight.phase}{t('home.phase')}
              </Text>
            </View>
            <Text style={styles.insightText}>{todayInsight.text}</Text>
            <Text style={styles.cycleDayText}>
              {language === 'sw' ? 'Siku' : 'Day'} {dayInCycle}{' '}
              {language === 'sw' ? 'ya mzunguko' : 'of cycle'}
            </Text>
          </View>

          <NUICard style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logTitle}>
                {language === 'sw' ? 'Rekodi Yako' : 'Your Log'}
              </Text>
              <NUIPressable
                onPress={handleAddLog}
                borderless
                accessibilityLabel={t('log.editLog')}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.text.secondary}
                />
              </NUIPressable>
            </View>
            <Text style={styles.logDate}>{logDateLabel}</Text>

            {recentMoods.length > 0 ? (
                <View style={styles.moodRow}>
                  <View style={styles.moodChips}>
                    {visibleMoods.map((mood: string) => {
                      const config = MOOD_CONFIG[mood];
                      if (!config) return null;
                      return (
                          <View key={mood} style={styles.moodChip}>
                            <Text style={styles.moodEmoji}>{config.emoji}</Text>
                            <Text style={styles.moodText} numberOfLines={1}>
                              {config.label}
                            </Text>
                          </View>
                      );
                    })}
                    {remainingMoods > 0 && (
                        <TouchableOpacity
                            style={styles.moreCircle}
                            onPress={handleAddLog}
                            accessibilityRole="button"
                            accessibilityLabel={`${remainingMoods} ${t('home.more')}`}
                        >
                          <Text style={styles.moreText}>
                            +{remainingMoods} {t('home.more')}
                          </Text>
                        </TouchableOpacity>
                    )}
                  </View>
                  {!!moodDateLabel && (
                      <Text style={styles.moodSub}>{moodDateLabel}</Text>
                  )}
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
                    {visibleSymptoms.map((symptom) => {
                      const config = SYMPTOM_CONFIG[symptom];
                      if (!config) return null;
                      return (
                          <View key={symptom} style={styles.symptomChip}>
                            <Ionicons
                                name={config.icon}
                                size={18}
                                color={config.color}
                            />
                            <Text style={styles.symptomLabel} numberOfLines={1}>
                              {config.label}
                            </Text>
                          </View>
                      );
                    })}
                    {remainingSymptoms > 0 && (
                        <TouchableOpacity
                            style={styles.moreCircle}
                            onPress={handleAddLog}
                        >
                          <Text style={styles.moreText}>
                            +{remainingSymptoms} {t('home.more')}
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
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    ...typography.headingSm,
    color: colors.text.inverse,
    fontWeight: '600',
    fontStyle: 'normal',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: 4,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  statTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
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
    ...typography.display,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.label,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statSub: {
    ...typography.label,
    color: colors.text.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  statDate: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.muted,
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
    ...typography.titleSm,
    position: 'absolute',
    fontWeight: '700',
    color: colors.brand.text,
  },
  ringSubtext: {
    ...typography.label,
    position: 'absolute',
    top: 70,
    fontWeight: '500',
    color: colors.brand.text,
  },
  ringDescription: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text.primary,
    fontWeight: '500',
    marginTop: -8,
    marginHorizontal: 40,
  },
  ringCycleDay: {
    ...typography.label,
    textAlign: 'center',
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  sourcesRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: colors.surface.tint,
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
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    fontStyle: 'normal',
    flexShrink: 1,
  },
  insightText: {
    ...typography.caption,
    color: colors.text.primary,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  cycleDayText: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  logCard: {
    marginHorizontal: 20,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    fontStyle: 'normal',
  },
  logDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  moodRow: {
    marginTop: 15,
    gap: 6,
  },
  moodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flexShrink: 1,
  },
  // Moods and symptoms are the same kind of thing, so they get the same chip:
  // neutral fill, hairline edge, one height. Previously moods were pink at
  // 16pt and symptoms grey at 12pt, sitting in rows of unequal height.
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.muted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    maxWidth: '100%',
  },
  moodEmoji: {
    // Matched to the label rather than set at 24pt, which made the chip tall
    // and left the text looking like a caption hung off a picture.
    ...typography.caption,
    fontWeight: '400',
  },
  moodText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text.primary,
    fontStyle: 'normal',
    flexShrink: 1,
  },
  moodSub: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  emptyMood: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.surface.muted,
    borderRadius: 8,
    gap: 8,
  },
  emptyText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  symptomTitle: {
    ...typography.body,
    marginTop: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 10,
    fontStyle: 'normal',
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  symptomChip: {
    // A pill, not a fixed-width circle: labels like "Maumivu ya Tumbo" could
    // never fit in 70px, so they overflowed and the shape collapsed.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.muted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    maxWidth: '100%',
  },
  symptomLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.text.primary,
    // Shrink rather than overflow when the label is long.
    flexShrink: 1,
  },
  // "+N more" is a control, not another value: no fill, just an outline, so
  // it reads as the way to see the rest rather than as one more chip.
  moreCircle: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  moreText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySymptoms: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface.muted,
    borderRadius: 8,
    gap: 8,
  },
});