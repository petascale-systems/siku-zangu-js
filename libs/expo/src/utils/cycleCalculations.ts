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
    color: '#F59E0B',
    label: language === 'en' ? 'Cramps' : 'Maumivu ya Tumbo',
  },
  fatigue: {
    icon: 'flash-outline',
    color: '#8B5CF6',
    label: language === 'en' ? 'Fatigue' : 'Uchovu',
  },
  bloating: {
    icon: 'water',
    color: '#3B82F6',
    label: language === 'en' ? 'Bloating' : 'Kuvimbiwa',
  },
  tender_breast: {
    icon: 'female',
    color: '#EC4899',
    label: language === 'en' ? 'Tender Breast' : 'Matiti Yanayouma',
  },
  backache: {
    icon: 'body-outline',
    color: '#EF4444',
    label: language === 'en' ? 'Backache' : 'Maumivu ya Mgongo',
  },
  headache: {
    icon: 'medkit',
    color: '#10B981',
    label: language === 'en' ? 'Headache' : 'Maumivu ya Kichwa',
  },
});

export const getMostRecentMood = (
  moodLogs: Array<{ mood: string; timestamp: string }> | undefined
): string | null => {
  if (!moodLogs || !Array.isArray(moodLogs) || moodLogs.length === 0) {
    return null;
  }

  const sortedMoods = [...moodLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return sortedMoods[0]?.mood || null;
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