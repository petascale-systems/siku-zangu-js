import { symptomColors } from '../theme';
export interface CycleData {
  periodDays: number[];
  fertilityDays: number[];
  ovulationDays: number[];
  predictedDays: number[];
  /** Day of the month → which day of its period it is (1 = first day). */
  dayOfPeriod: Record<number, number>;
  nextPeriodDate: Date;
  /** The next ovulation not yet passed: today's, or a later cycle's. */
  ovulationDate: Date;
  /** The fertile window still to come or under way. */
  fertilityWindow: { start: Date; end: Date };
  daysUntilPeriod: number;
  daysInMonth: number;
}

export interface CyclePhaseInsight {
  phase: string;
  text: string;
}

export interface CycleMetrics {
  daysUntilPeriod: number;
  ovulationDate: Date;
  nextPeriodDate: Date;
  cycleLength: number;
  progress: number;
  daysUntilOvulation: number;
  fertileDaysRemaining: number;
  dayInCycle: number;
}

export interface MoodConfig {
  emoji: string;
  label: string;
}

export interface SymptomConfig {
  icon: any;
  color: string;
  label: string;
}
export const getDaysInMonth = (month: number, year: number): number =>
  new Date(year, month + 1, 0).getDate();

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * A stored `YYYY-MM-DD` as local midnight on that day.
 *
 * `new Date('2026-09-10')` is UTC midnight, which west of UTC is still the 9th
 * locally — every date then drew a day early.
 */
export const parseISODate = (iso: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Whole days from one local midnight to another. Rounded, not floored: a
 * daylight-saving change makes a day 23 or 25 hours long, and flooring
 * 27.96 days to 27 put the cycle a whole cycle behind for that day.
 */
export const daysBetween = (from: Date, to: Date): number => {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
};

export const getMostRecentCycleStart = (
  prevCycleStartDate: string,
  avgCycleLength: number,
  referenceDate: Date = new Date()
): Date => {
  const prevStart = parseISODate(prevCycleStartDate);
  const daysSincePrev = daysBetween(prevStart, referenceDate);
  const completeCycles = Math.floor(daysSincePrev / avgCycleLength);

  const mostRecent = new Date(prevStart);
  mostRecent.setDate(mostRecent.getDate() + completeCycles * avgCycleLength);
  return mostRecent;
};

export const getNextCycleStart = (
  mostRecentCycleStart: Date,
  avgCycleLength: number
): Date => {
  const next = new Date(mostRecentCycleStart);
  next.setDate(next.getDate() + avgCycleLength);
  return next;
};

export const getOvulationDate = (
  nextCycleStart: Date,
  daysBeforePeriod = 14
): Date => {
  const ov = new Date(nextCycleStart);
  ov.setDate(ov.getDate() - daysBeforePeriod);
  return ov;
};

export const getFertilityWindow = (
  ovulationDate: Date,
  daysBefore = 5,
  daysAfter = 1
): { start: Date; end: Date } => {
  const start = new Date(ovulationDate);
  start.setDate(start.getDate() - daysBefore);

  const end = new Date(ovulationDate);
  end.setDate(end.getDate() + daysAfter);

  return { start, end };
};

export const getDaysInRange = (
  startDate: Date,
  endDate: Date,
  month: number,
  year: number
): number[] => {
  const days: number[] = [];
  const daysInMonth = getDaysInMonth(month, year);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);

  if (startDate > monthEnd || endDate < monthStart) return days;

  for (let d = 1; d <= daysInMonth; d++) {
    const current = new Date(year, month, d);
    if (current >= startDate && current <= endDate) days.push(d);
  }
  return days;
};

export const getDaysUntilPeriod = (
  nextPeriodDate: Date,
  referenceDate: Date = new Date()
): number => {
  return Math.max(0, daysBetween(referenceDate, nextPeriodDate));
};

export const getMoodConfig = (language = 'en'): Record<string, MoodConfig> => ({
  happy: { emoji: '😊', label: language === 'en' ? 'Happy' : 'Furaha' },
  sad: { emoji: '😢', label: language === 'en' ? 'Sad' : 'Huzuni' },
  tired: { emoji: '😴', label: language === 'en' ? 'Tired' : 'Kuchoka' },
  angry: { emoji: '😠', label: language === 'en' ? 'Angry' : 'Hasira' },
  in_love: { emoji: '😍', label: language === 'en' ? 'In Love' : 'Mapenzi' },
  calm: { emoji: '😌', label: language === 'en' ? 'Calm' : 'Utulivu' },
  anxious: { emoji: '😰', label: language === 'en' ? 'Anxious' : 'Wasiwasi' },
  curious: { emoji: '🤔', label: language === 'en' ? 'Curious' : 'Udadisi' },
});

export const getSymptomConfig = (language = 'en'): Record<string, SymptomConfig> => ({
  cramps: {
    icon: 'fitness',
    color: symptomColors.cramps,
    label: language === 'en' ? 'Cramps' : 'Maumivu ya Tumbo',
  },
  fatigue: {
    icon: 'flash-outline',
    color: symptomColors.fatigue,
    label: language === 'en' ? 'Fatigue' : 'Uchovu',
  },
  bloating: {
    icon: 'water',
    color: symptomColors.bloating,
    label: language === 'en' ? 'Bloating' : 'Kuvimbiwa',
  },
  tender_breast: {
    icon: 'female',
    color: symptomColors.tender_breast,
    label: language === 'en' ? 'Tender Breast' : 'Matiti Yanayouma',
  },
  backache: {
    icon: 'body-outline',
    color: symptomColors.backache,
    label: language === 'en' ? 'Backache' : 'Maumivu ya Mgongo',
  },
  headache: {
    icon: 'medkit',
    color: symptomColors.headache,
    label: language === 'en' ? 'Headache' : 'Maumivu ya Kichwa',
  },
});

export type MoodLog = { mood: string; timestamp: string };

export const getMostRecentMoodLog = (
  moodLogs: MoodLog[] | undefined
): MoodLog | null => {
  if (!moodLogs || !Array.isArray(moodLogs) || moodLogs.length === 0) {
    return null;
  }

  const sortedMoods = [...moodLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return sortedMoods[0] || null;
};

/**
 * Newest timestamp across any number of log arrays, or null when nothing has
 * ever been logged. Used to label how long ago the user last logged anything.
 */
export const getMostRecentLogTimestamp = (
  ...logGroups: Array<Array<{ timestamp: string }> | undefined>
): string | null => {
  let best: string | null = null;
  let bestMs = -Infinity;

  for (const group of logGroups) {
    if (!Array.isArray(group)) continue;
    for (const log of group) {
      const ms = new Date(log.timestamp).getTime();
      if (Number.isFinite(ms) && ms > bestMs) {
        bestMs = ms;
        best = log.timestamp;
      }
    }
  }

  return best;
};

/**
 * The distinct values logged on the user's most recent logging day, newest
 * first. Used to pre-select the log-entry screen so someone who opens the app
 * occasionally can confirm what they already logged instead of re-entering it.
 *
 * Scoped to the latest day rather than all history on purpose: the whole
 * history would tick nearly every option after a few weeks of use.
 */
export const getLastLoggedValues = <T extends { timestamp: string }>(
  logs: T[] | undefined,
  pick: (log: T) => string | undefined
): string[] => {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  const startOfDay = (ms: number): number => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  let latestMs = -Infinity;
  for (const log of logs) {
    const ms = new Date(log.timestamp).getTime();
    if (Number.isFinite(ms) && ms > latestMs) latestMs = ms;
  }
  if (!Number.isFinite(latestMs)) return [];

  const latestDay = startOfDay(latestMs);

  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const values: string[] = [];
  const seen = new Set<string>();
  for (const log of sorted) {
    const ms = new Date(log.timestamp).getTime();
    if (!Number.isFinite(ms) || startOfDay(ms) !== latestDay) continue;
    const value = pick(log);
    if (value && !seen.has(value)) {
      seen.add(value);
      values.push(value);
    }
  }
  return values;
};

export const getRecentSymptoms = (
  symptomLogs:
    | Array<{
        symptom: string;
        timestamp: string;
      }>
    | undefined,
  limit = 3
): string[] => {
  if (!symptomLogs || !Array.isArray(symptomLogs) || symptomLogs.length === 0) {
    return [];
  }

  const sortedSymptoms = [...symptomLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  const uniqueSymptoms: string[] = [];
  const seen = new Set<string>();

  for (const log of sortedSymptoms) {
    if (!seen.has(log.symptom)) {
      uniqueSymptoms.push(log.symptom);
      seen.add(log.symptom);
      if (uniqueSymptoms.length === limit) break;
    }
  }

  return uniqueSymptoms;
};

export const calculateCycleMetrics = (
  prevCycleStartDate: string | undefined,
  avgCycleLength = 28
): CycleMetrics => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!prevCycleStartDate) {
    return {
      daysUntilPeriod: 6,
      ovulationDate: new Date(2025, 9, 10),
      nextPeriodDate: new Date(2025, 9, 24),
      cycleLength: 28,
      progress: 0.75,
      daysUntilOvulation: 12,
      fertileDaysRemaining: 8,
      dayInCycle: 18,
    };
  }

  const mostRecentStart = getMostRecentCycleStart(
    prevCycleStartDate,
    avgCycleLength,
    today
  );

  const nextPeriodDate = getNextCycleStart(mostRecentStart, avgCycleLength);
  const ovulationDate = getOvulationDate(nextPeriodDate);
  const { end: fertilityEnd } = getFertilityWindow(ovulationDate);
  const daysUntilPeriod = getDaysUntilPeriod(nextPeriodDate, today);

  const daysSinceCycleStart = daysBetween(mostRecentStart, today);
  const progress = Math.min(daysSinceCycleStart / avgCycleLength, 1);

  const daysUntilOvulation = Math.max(0, daysBetween(today, ovulationDate));

  const fertileDaysRemaining = Math.max(0, daysBetween(today, fertilityEnd));

  const dayInCycle = (daysSinceCycleStart % avgCycleLength) + 1;

  return {
    daysUntilPeriod,
    ovulationDate,
    nextPeriodDate,
    cycleLength: avgCycleLength,
    progress,
    daysUntilOvulation,
    fertileDaysRemaining,
    dayInCycle,
  };
};
export const getCyclePhaseInsight = (
  dayInCycle: number,
  ovulationDate: Date,
  avgPeriodLength = 6,
  _avgCycleLength = 28,
  language = 'en'
): CyclePhaseInsight => {
  const isSw = language === 'sw';

  if (dayInCycle <= avgPeriodLength) {
    return {
      phase: isSw ? 'Hedhi' : 'Menstrual',
      text: isSw
        ? 'Siku za hedhi. Pumzika, kunywa maji mengi, jikande na maji ya moto unapokuwa na maumivu.'
        : 'Period days. Rest, hydrate, use a heating pad for cramps.',
    };
  }

  const ovDay = ovulationDate.getDate();
  const fertStart = ovDay - 5;
  const fertEnd = ovDay + 1;

  if (dayInCycle >= fertStart && dayInCycle <= fertEnd) {
    if (dayInCycle === ovDay) {
      return {
        phase: isSw ? 'Uzazi' : 'Ovulation',
        text: isSw
          ? 'Leo ovari inapevuka. Kipindi hiki kina uwezekano mkubwa wa kutunga mimba'
          : "You're ovulating today! Peak fertility.",
      };
    }
    return {
      phase: isSw ? 'Dirisha la Uzazi' : 'Fertile Window',
      text: isSw
        ? 'Dirisha la uzazi. Unaweza kuhisi umechangamka zaidi'
        : 'Fertile days. You may feel more energetic.',
    };
  }

  if (dayInCycle <= ovDay - 6) {
    return {
      phase: isSw ? 'Folikula' : 'Follicular',
      text: isSw
        ? 'Nguvu zinaongezeka. Huu ni wakati mzuri wa mazoezi!'
        : 'Energy rising. Great time for workouts!',
    };
  }

  return {
    phase: isSw ? 'Awamu ya Luteal' : 'Luteal',
    text: isSw
      ? 'Awamu ya luteal. Kula vyakula vyenye madini chuma. Ugonjwa wa kabla ya hedhi unaweza kuja.'
      : 'Luteal phase. Eat iron-rich foods. PMS may start.',
  };
};

/**
 * What the calendar ring draws for one month, which can be any month — past
 * ones to correct a date, future ones to see what is coming.
 *
 * Only the cycle that began on `prevCycleStartDate` was actually logged, so
 * only its days are period days. Every other cycle is a projection and is
 * predicted, past or future. Fertility and ovulation are shown from the
 * current cycle on; for earlier cycles they were never more than a guess.
 * Nothing is drawn before the stored start, since there is no data for it.
 *
 * `nextPeriodDate`, `ovulationDate`, `fertilityWindow` and `daysUntilPeriod`
 * are relative to today, whichever month is displayed.
 */
export const calculateCycleData = (
  prevCycleStartDate: string,
  avgCycleLength: number,
  avgPeriodLength: number,
  currentMonth: number,
  currentYear: number,
  referenceDate: Date = new Date()
): CycleData => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth, daysInMonth);

  const mostRecentStart = getMostRecentCycleStart(
    prevCycleStartDate,
    avgCycleLength,
    today
  );
  const nextPeriod = getNextCycleStart(mostRecentStart, avgCycleLength);

  // The card shows what is ahead, so once this cycle's ovulation or fertile
  // window is over, move to the next cycle's rather than "expecting" a date
  // that has passed.
  let ovulation = getOvulationDate(nextPeriod);
  if (ovulation < today) {
    ovulation = getOvulationDate(getNextCycleStart(nextPeriod, avgCycleLength));
  }
  let fertilityWindow = getFertilityWindow(getOvulationDate(nextPeriod));
  if (fertilityWindow.end < today) {
    fertilityWindow = getFertilityWindow(
      getOvulationDate(getNextCycleStart(nextPeriod, avgCycleLength))
    );
  }

  const firstStart = parseISODate(prevCycleStartDate);

  const periodDays: number[] = [];
  const predictedDays: number[] = [];
  const fertilityDays: number[] = [];
  const ovulationDays: number[] = [];
  const dayOfPeriod: Record<number, number> = {};
  const addAll = (into: number[], days: number[]) =>
    days.forEach((d) => !into.includes(d) && into.push(d));

  // Start one cycle before the month so a period or fertile window that began
  // in the previous month and runs into this one is still drawn.
  const cyclesBefore = Math.floor(daysBetween(firstStart, monthStart) / avgCycleLength);
  for (let k = Math.max(0, cyclesBefore - 1); ; k++) {
    const cycleStart = new Date(firstStart);
    cycleStart.setDate(cycleStart.getDate() + k * avgCycleLength);
    if (cycleStart > monthEnd) break;

    const periodEnd = new Date(cycleStart);
    periodEnd.setDate(periodEnd.getDate() + avgPeriodLength - 1);
    const days = getDaysInRange(cycleStart, periodEnd, currentMonth, currentYear);
    addAll(k === 0 ? periodDays : predictedDays, days);
    // Counted from the period's own first day, which may be last month.
    for (const d of days) {
      dayOfPeriod[d] = daysBetween(cycleStart, new Date(currentYear, currentMonth, d)) + 1;
    }

    if (cycleStart >= mostRecentStart) {
      const cycleOvulation = getOvulationDate(
        getNextCycleStart(cycleStart, avgCycleLength)
      );
      const { start: fertStart, end: fertEnd } = getFertilityWindow(cycleOvulation);
      addAll(fertilityDays, getDaysInRange(fertStart, fertEnd, currentMonth, currentYear));
      addAll(
        ovulationDays,
        getDaysInRange(cycleOvulation, cycleOvulation, currentMonth, currentYear)
      );
    }
  }

  return {
    periodDays,
    fertilityDays,
    ovulationDays,
    predictedDays,
    dayOfPeriod,
    nextPeriodDate: nextPeriod,
    ovulationDate: ovulation,
    fertilityWindow,
    daysUntilPeriod: getDaysUntilPeriod(nextPeriod, today),
    daysInMonth,
  };
};

export const formatDate = (
  date: Date,
  monthNames: string[],
  includeYear = false
): string => {
  const m = monthNames[date.getMonth()];
  const d = date.getDate();
  return includeYear ? `${m} ${d}, ${date.getFullYear()}` : `${m} ${d}`;
};

export const formatDateRange = (
  start: Date,
  end: Date,
  monthNames: string[]
): string => {
  const sM = monthNames[start.getMonth()].slice(0, 3);
  const eM = monthNames[end.getMonth()].slice(0, 3);
  return `${sM} ${start.getDate()} – ${eM} ${end.getDate()}`;
};

/**
 * "Logged 3 days ago" for a log entry, in English or Swahili. Returns null for
 * missing or unparseable input so callers can fall back to their own label.
 *
 * Compares whole calendar days rather than elapsed hours, so something logged
 * at 23:50 reads "yesterday" at 01:00 the next morning rather than "today".
 */
export const formatRelativeLogDate = (
  timestamp: string | Date | null | undefined,
  language: 'en' | 'sw' = 'en',
  referenceDate: Date = new Date()
): string | null => {
  if (!timestamp) return null;

  const logged = new Date(timestamp);
  if (!Number.isFinite(logged.getTime())) return null;

  const startOfLogged = new Date(logged);
  startOfLogged.setHours(0, 0, 0, 0);
  const startOfToday = new Date(referenceDate);
  startOfToday.setHours(0, 0, 0, 0);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const daysAgo = Math.round(
    (startOfToday.getTime() - startOfLogged.getTime()) / MS_PER_DAY
  );

  // Clock skew can put a log slightly in the future; treat that as today.
  if (daysAgo <= 0) {
    return language === 'sw' ? 'Imerekodiwa leo' : 'Logged today';
  }
  if (daysAgo === 1) {
    return language === 'sw' ? 'Imerekodiwa jana' : 'Logged yesterday';
  }
  if (daysAgo <= 30) {
    return language === 'sw'
      ? `Imerekodiwa siku ${daysAgo} zilizopita`
      : `Logged ${daysAgo} days ago`;
  }

  const day = logged.getDate();
  const year = logged.getFullYear();
  return language === 'sw'
    ? `Imerekodiwa ${day} ${MONTH_NAMES_SW[logged.getMonth()]} ${year}`
    : `Logged ${MONTH_NAMES_EN[logged.getMonth()].slice(0, 3)} ${day}, ${year}`;
};

export const getCircularCoordinates = (
  day: number,
  totalDays: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number; angle: number } => {
  const angle = ((day - 1) / totalDays) * (2 * Math.PI) - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
    angle,
  };
};

/**
 * The inverse of `getCircularCoordinates`: which day a tap at (x, y) lands on.
 * Any point in the ring band counts, not just the day's dot, so the whole ring
 * is a tap target. Returns null for taps in the centre or outside the ring.
 */
export const getDayFromPoint = (
  x: number,
  y: number,
  totalDays: number,
  centerX: number,
  centerY: number,
  minRadius: number,
  maxRadius: number
): number | null => {
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.hypot(dx, dy);
  if (distance < minRadius || distance > maxRadius) return null;

  // Shift so 12 o'clock is 0 and normalise to [0, 2π).
  const TWO_PI = 2 * Math.PI;
  const angle = (((Math.atan2(dy, dx) + Math.PI / 2) % TWO_PI) + TWO_PI) % TWO_PI;
  // Rounding past the last day wraps back to day 1 rather than totalDays + 1.
  return (Math.round((angle / TWO_PI) * totalDays) % totalDays) + 1;
};

/** Local `YYYY-MM-DD`, the format `prev_cycle_start_date` is stored in. */
export const toISODateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

/**
 * Period length, in days, from a first day to a last day inclusive: marking
 * the start day itself as the end is a one-day period.
 */
export const getPeriodLengthDays = (startISO: string, endISO: string): number =>
  daysBetween(parseISODate(startISO), parseISODate(endISO)) + 1;

export type PeriodDatesUpdate = {
  prev_cycle_start_date?: string;
  prev_period_end_date?: string;
  avg_period_length_days?: number;
  period_start_logs?: Array<{ date: string; timestamp: string }>;
  period_end_logs?: Array<{ date: string; timestamp: string }>;
};

/**
 * The kv update for marking `startISO` as the first day of the last period,
 * keeping the stored last day and the period length in step:
 * - an end still after the new start stays, and the length is re-measured;
 * - an end on or before the new start, or too far after it to be the same
 *   period, no longer belongs to this period and is cleared.
 */
export const buildPeriodStartUpdate = (
  startISO: string,
  currentEndISO: string | undefined,
  now: Date = new Date()
): PeriodDatesUpdate => {
  const update: PeriodDatesUpdate = {
    prev_cycle_start_date: startISO,
    period_start_logs: [{ date: startISO, timestamp: now.toISOString() }],
  };
  if (!currentEndISO) return update;

  const length = getPeriodLengthDays(startISO, currentEndISO);
  if (length >= 2 && length <= MAX_PERIOD_LENGTH_DAYS) {
    update.avg_period_length_days = length;
  } else {
    update.prev_period_end_date = '';
  }
  return update;
};

/**
 * The kv update for a period length chosen directly ("Last period lasted
 * for"), with the last day moved to match. An end that would fall after
 * today means the period is still under way, so the end is cleared rather
 * than set to a day that has not happened. The end is only logged when it
 * actually moves.
 */
export const buildPeriodLengthUpdate = (
  startISO: string,
  lengthDays: number,
  currentEndISO: string | undefined,
  now: Date = new Date()
): PeriodDatesUpdate => {
  const end = parseISODate(startISO);
  end.setDate(end.getDate() + lengthDays - 1);
  const endISO = toISODateString(end);

  const update: PeriodDatesUpdate = { avg_period_length_days: lengthDays };
  if (endISO > toISODateString(now)) {
    if (currentEndISO) update.prev_period_end_date = '';
  } else if (endISO !== currentEndISO) {
    update.prev_period_end_date = endISO;
    update.period_end_logs = [{ date: endISO, timestamp: now.toISOString() }];
  }
  return update;
};

/**
 * The kv update for marking `endISO` as the last day of the period that began
 * on `startISO`. The length is written too — it is what the calendar draws
 * and what Log Entry shows as "Last period lasted for".
 */
export const buildPeriodEndUpdate = (
  startISO: string,
  endISO: string,
  now: Date = new Date()
): PeriodDatesUpdate => ({
  prev_period_end_date: endISO,
  avg_period_length_days: getPeriodLengthDays(startISO, endISO),
  period_end_logs: [{ date: endISO, timestamp: now.toISOString() }],
});

/** `DD/MM`, the compact form the period history rows use. */
export const formatShortDate = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

/** One cycle as `GET /api/users/:id/period-history` returns it. */
export type HistoryCycleInput = {
  start_date: string;
  end_date: string | null;
  cycle_length_days: number | null;
};

/**
 * Where everything sits on one history bar, in days from the cycle's first
 * day. The bar is `barDays` long.
 */
export type HistoryRow = {
  start: Date;
  /** Last period day: the logged one, or the start plus the average length. */
  periodEnd: Date;
  periodDays: number;
  /** True when no end was logged and `periodDays` is the average. */
  periodEstimated: boolean;
  /** Null for the current cycle, which has not ended. */
  cycleLength: number | null;
  barDays: number;
  fertileStartDay: number;
  fertileEndDay: number;
  ovulationDay: number;
  /** Today's offset; only set on the current cycle. */
  todayDay: number | null;
  isCurrent: boolean;
};

/**
 * Lays out one cycle for the history card. A finished cycle is as long as it
 * was; the current one is drawn to its predicted end. Ovulation is counted
 * back 14 days from that end, as on the calendar ring.
 */
export const buildHistoryRow = (
  cycle: HistoryCycleInput,
  avgCycleLength: number,
  avgPeriodLength: number,
  today: Date = new Date()
): HistoryRow => {
  const start = parseISODate(cycle.start_date);
  const isCurrent = cycle.cycle_length_days === null;
  const barDays = cycle.cycle_length_days ?? avgCycleLength;

  const periodEstimated = !cycle.end_date;
  const periodDays = cycle.end_date
    ? getPeriodLengthDays(cycle.start_date, cycle.end_date)
    : avgPeriodLength;
  const periodEnd = new Date(start);
  periodEnd.setDate(periodEnd.getDate() + periodDays - 1);

  const cycleEnd = new Date(start);
  cycleEnd.setDate(cycleEnd.getDate() + barDays);
  const ovulation = getOvulationDate(cycleEnd);
  const fertile = getFertilityWindow(ovulation);

  const todayDay = isCurrent ? daysBetween(start, today) : null;

  return {
    start,
    periodEnd,
    periodDays,
    periodEstimated,
    cycleLength: cycle.cycle_length_days,
    barDays,
    fertileStartDay: daysBetween(start, fertile.start),
    fertileEndDay: daysBetween(start, fertile.end),
    ovulationDay: daysBetween(start, ovulation),
    todayDay: todayDay !== null && todayDay >= 0 && todayDay < barDays ? todayDay : null,
    isCurrent,
  };
};

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SW = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba',
];
/**
 * The single source of truth for the cycle- and period-length pickers. Both the
 * onboarding screens and the log-entry screen read these, so the ranges a user
 * sees at signup always match the ones they can edit to later.
 */
export const MIN_CYCLE_LENGTH_DAYS = 21;
export const MAX_CYCLE_LENGTH_DAYS = 35;
export const MIN_PERIOD_LENGTH_DAYS = 1;
export const MAX_PERIOD_LENGTH_DAYS = 15;

const daysRange = (min: number, max: number): number[] =>
  Array.from({ length: max - min + 1 }, (_, i) => min + i);

export const CYCLE_LENGTH_OPTIONS = daysRange(
  MIN_CYCLE_LENGTH_DAYS,
  MAX_CYCLE_LENGTH_DAYS
);

export const PERIOD_LENGTH_OPTIONS = daysRange(
  MIN_PERIOD_LENGTH_DAYS,
  MAX_PERIOD_LENGTH_DAYS
);
