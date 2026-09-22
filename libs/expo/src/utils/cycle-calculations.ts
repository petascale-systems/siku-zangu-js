import { symptomColors } from '../theme';
export interface CycleData {
  periodDays: number[];
  fertilityDays: number[];
  ovulationDays: number[];
  predictedDays: number[];
  nextPeriodDate: Date;
  ovulationDate: Date;
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

export const getMostRecentCycleStart = (
  prevCycleStartDate: string,
  avgCycleLength: number,
  referenceDate: Date = new Date()
): Date => {
  const prevStart = new Date(prevCycleStartDate);
  prevStart.setHours(0, 0, 0, 0);

  const refDate = new Date(referenceDate);
  refDate.setHours(0, 0, 0, 0);

  const daysSincePrev = Math.floor(
    (refDate.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
  );
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
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
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

  const daysSinceCycleStart = Math.floor(
    (today.getTime() - mostRecentStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = Math.min(daysSinceCycleStart / avgCycleLength, 1);

  const daysUntilOvulation = Math.max(
    0,
    Math.ceil(
      (ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const fertileDaysRemaining = Math.max(
    0,
    Math.ceil(
      (fertilityEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

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

export const calculateCycleData = (
  prevCycleStartDate: string,
  avgCycleLength: number,
  avgPeriodLength: number,
  currentMonth: number,
  currentYear: number
): CycleData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const mostRecentStart = getMostRecentCycleStart(
    prevCycleStartDate,
    avgCycleLength,
    today
  );

  const nextPeriod = getNextCycleStart(mostRecentStart, avgCycleLength);
  const ovulation = getOvulationDate(nextPeriod);
  const { start: fertStart, end: fertEnd } = getFertilityWindow(ovulation);

  const currentPeriodEnd = new Date(mostRecentStart);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + avgPeriodLength - 1);

  const periodDays = getDaysInRange(
    mostRecentStart,
    currentPeriodEnd,
    currentMonth,
    currentYear
  );

  const predictedDays: number[] = [];
  const nextPeriodEnd = new Date(nextPeriod);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + avgPeriodLength - 1);

  if (nextPeriod > today) {
    predictedDays.push(
      ...getDaysInRange(nextPeriod, nextPeriodEnd, currentMonth, currentYear)
    );
  }
  const followingCycle = getNextCycleStart(nextPeriod, avgCycleLength);
  if (followingCycle.getFullYear() === currentYear && followingCycle.getMonth() === currentMonth) {
    const followingEnd = new Date(followingCycle);
    followingEnd.setDate(followingEnd.getDate() + avgPeriodLength - 1);
    const extra = getDaysInRange(followingCycle, followingEnd, currentMonth, currentYear);
    extra.forEach(d => !predictedDays.includes(d) && predictedDays.push(d));
  }

  const fertilityDays = getDaysInRange(fertStart, fertEnd, currentMonth, currentYear);
  const ovulationDays = getDaysInRange(ovulation, ovulation, currentMonth, currentYear);

  const daysUntilPeriod = getDaysUntilPeriod(nextPeriod, today);

  return {
    periodDays,
    fertilityDays,
    ovulationDays,
    predictedDays,
    nextPeriodDate: nextPeriod,
    ovulationDate: ovulation,
    daysUntilPeriod,
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
