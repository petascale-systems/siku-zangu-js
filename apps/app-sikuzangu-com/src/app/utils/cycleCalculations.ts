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
export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMostRecentCycleStart = (
  prevCycleStartDate: string,
  avgCycleLength: number,
  referenceDate: Date = new Date()
): Date => {
  const prevStart = new Date(prevCycleStartDate);
  prevStart.setHours(0, 0, 0, 0);

  const refDate = new Date(referenceDate);
  refDate.setHours(0, 0, 0, 0);

  const daysSincePrevCycle = Math.floor(
    (refDate.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const completeCycles = Math.floor(daysSincePrevCycle / avgCycleLength);

  const mostRecentStart = new Date(prevStart);
  mostRecentStart.setDate(
    mostRecentStart.getDate() + completeCycles * avgCycleLength
  );

  return mostRecentStart;
};

export const getNextCycleStart = (
  mostRecentCycleStart: Date,
  avgCycleLength: number
): Date => {
  const nextStart = new Date(mostRecentCycleStart);
  nextStart.setDate(nextStart.getDate() + avgCycleLength);
  return nextStart;
};

export const getOvulationDate = (
  nextCycleStart: Date,
  daysBeforePeriod = 14
): Date => {
  const ovulation = new Date(nextCycleStart);
  ovulation.setDate(ovulation.getDate() - daysBeforePeriod);
  return ovulation;
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

  if (startDate > monthEnd || endDate < monthStart) {
    return days;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    if (currentDate >= startDate && currentDate <= endDate) {
      days.push(day);
    }
  }

  return days;
};

export const getDaysUntilPeriod = (
  nextPeriodDate: Date,
  referenceDate: Date = new Date()
): number => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil(
    (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysUntil);
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

  const mostRecentCycleStart = getMostRecentCycleStart(
    prevCycleStartDate,
    avgCycleLength,
    today
  );

  const nextCycleStart = getNextCycleStart(
    mostRecentCycleStart,
    avgCycleLength
  );

  const followingCycleStart = getNextCycleStart(nextCycleStart, avgCycleLength);

  const ovulationDate = getOvulationDate(nextCycleStart);

  const { start: fertilityStart, end: fertilityEnd } =
    getFertilityWindow(ovulationDate);

  const periodDays: number[] = [];
  const fertilityDays: number[] = [];
  const ovulationDays: number[] = [];
  const predictedDays: number[] = [];

  const currentPeriodEnd = new Date(mostRecentCycleStart);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + avgPeriodLength - 1);

  periodDays.push(
    ...getDaysInRange(
      mostRecentCycleStart,
      currentPeriodEnd,
      currentMonth,
      currentYear
    )
  );

  const nextPeriodEnd = new Date(nextCycleStart);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + avgPeriodLength - 1);

  if (nextCycleStart > today) {
    predictedDays.push(
      ...getDaysInRange(
        nextCycleStart,
        nextPeriodEnd,
        currentMonth,
        currentYear
      )
    );
  }

  const followingPeriodEnd = new Date(followingCycleStart);
  followingPeriodEnd.setDate(
    followingPeriodEnd.getDate() + avgPeriodLength - 1
  );

  if (followingCycleStart > today) {
    const followingDays = getDaysInRange(
      followingCycleStart,
      followingPeriodEnd,
      currentMonth,
      currentYear
    );
    followingDays.forEach((day) => {
      if (!predictedDays.includes(day)) {
        predictedDays.push(day);
      }
    });
  }

  fertilityDays.push(
    ...getDaysInRange(fertilityStart, fertilityEnd, currentMonth, currentYear)
  );

  const ovulationEnd = new Date(ovulationDate);
  ovulationEnd.setDate(ovulationEnd.getDate() + 1);

  ovulationDays.push(
    ...getDaysInRange(ovulationDate, ovulationEnd, currentMonth, currentYear)
  );

  const daysUntilPeriod = getDaysUntilPeriod(nextCycleStart, today);

  return {
    periodDays,
    fertilityDays,
    ovulationDays,
    predictedDays,
    nextPeriodDate: nextCycleStart,
    ovulationDate,
    daysUntilPeriod,
    daysInMonth,
  };
};

export const formatDate = (
  date: Date,
  monthNames: string[],
  includeYear = false
): string => {
  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();

  if (includeYear) {
    return `${monthName} ${day}, ${date.getFullYear()}`;
  }

  return `${monthName} ${day}`;
};

export const formatDateRange = (
  startDate: Date,
  endDate: Date,
  monthNames: string[]
): string => {
  const startMonth = monthNames[startDate.getMonth()].slice(0, 3);
  const endMonth = monthNames[endDate.getMonth()].slice(0, 3);
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
};

export const getCircularCoordinates = (
  day: number,
  totalDays: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number; angle: number } => {
  const angle = ((day - 1) / totalDays) * (2 * Math.PI) - Math.PI / 2;
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  return { x, y, angle };
};

export const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const MONTH_NAMES_SW = [
  'Januari',
  'Februari',
  'Machi',
  'Aprili',
  'Mei',
  'Juni',
  'Julai',
  'Agosti',
  'Septemba',
  'Oktoba',
  'Novemba',
  'Desemba',
];
