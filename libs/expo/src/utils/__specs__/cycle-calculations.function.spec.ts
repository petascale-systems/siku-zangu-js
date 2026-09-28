import {
  CYCLE_LENGTH_OPTIONS,
  PERIOD_LENGTH_OPTIONS,
  formatRelativeLogDate,
  getCircularCoordinates,
  getDayFromPoint,
  buildHistoryRow,
  buildPeriodEndUpdate,
  buildPeriodLengthUpdate,
  formatShortDate,
  buildPeriodStartUpdate,
  calculateCycleData,
  getDaysUntilPeriod,
  getMostRecentCycleStart,
  getPeriodLengthDays,
  toISODateString,
  getLastLoggedValues,
  getMostRecentLogTimestamp,
  getMostRecentMoodLog,
  getRecentSymptoms,
} from '../cycle-calculations';

const at = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m, d, h, min).toISOString();

// Fixed reference so these never depend on the day they run.
const NOW = new Date(2026, 8, 21, 9, 0, 0);

describe('length options', () => {
  it('offers cycles of 21-35 days', () => {
    expect(CYCLE_LENGTH_OPTIONS[0]).toBe(21);
    expect(CYCLE_LENGTH_OPTIONS.at(-1)).toBe(35);
    expect(CYCLE_LENGTH_OPTIONS).toHaveLength(15);
  });

  it('offers periods of 1-15 days', () => {
    expect(PERIOD_LENGTH_OPTIONS[0]).toBe(1);
    expect(PERIOD_LENGTH_OPTIONS.at(-1)).toBe(15);
    expect(PERIOD_LENGTH_OPTIONS).toHaveLength(15);
  });
});

describe('formatRelativeLogDate', () => {
  it.each([
    [at(2026, 8, 21, 8), 'en', 'Logged today'],
    [at(2026, 8, 20), 'en', 'Logged yesterday'],
    [at(2026, 8, 18), 'en', 'Logged 3 days ago'],
    [at(2026, 7, 22), 'en', 'Logged 30 days ago'],
    [at(2026, 6, 15), 'en', 'Logged Jul 15, 2026'],
    [at(2026, 8, 21, 8), 'sw', 'Imerekodiwa leo'],
    [at(2026, 8, 20), 'sw', 'Imerekodiwa jana'],
    [at(2026, 8, 18), 'sw', 'Imerekodiwa siku 3 zilizopita'],
    [at(2026, 6, 15), 'sw', 'Imerekodiwa 15 Julai 2026'],
  ])('%s in %s reads "%s"', (ts, lang, expected) => {
    expect(formatRelativeLogDate(ts, lang as 'en' | 'sw', NOW)).toBe(expected);
  });

  // Compares calendar days, not elapsed hours: logged at 23:50, read at 01:10.
  it('calls late-night entries yesterday, not today', () => {
    expect(
      formatRelativeLogDate(
        new Date(2026, 8, 20, 23, 50).toISOString(),
        'en',
        new Date(2026, 8, 21, 1, 10)
      )
    ).toBe('Logged yesterday');
  });

  it('treats a clock-skewed future entry as today', () => {
    expect(formatRelativeLogDate(at(2026, 8, 22), 'en', NOW)).toBe('Logged today');
  });

  it.each([[null], [undefined], ['not-a-date']])(
    'returns null for %s so callers can fall back',
    (input) => {
      expect(formatRelativeLogDate(input as never, 'en', NOW)).toBeNull();
    }
  );
});

describe('getMostRecentLogTimestamp', () => {
  const moods = [
    { mood: 'sad', timestamp: at(2026, 8, 10) },
    { mood: 'calm', timestamp: at(2026, 8, 19) },
  ];
  const symptoms = [{ symptom: 'cramps', timestamp: at(2026, 8, 20) }];

  it('picks the newest across every group', () => {
    expect(getMostRecentLogTimestamp(moods, symptoms)).toBe(at(2026, 8, 20));
  });

  it('returns null when nothing has been logged', () => {
    expect(getMostRecentLogTimestamp(undefined, [])).toBeNull();
  });

  it('skips unparseable timestamps', () => {
    expect(
      getMostRecentLogTimestamp([
        { timestamp: 'nope' },
        { timestamp: at(2026, 8, 5) },
      ])
    ).toBe(at(2026, 8, 5));
  });
});

describe('getLastLoggedValues', () => {
  // Scoped to the latest DAY: using all history would tick nearly every option
  // after a few weeks of use.
  const logs = [
    { symptom: 'headache', timestamp: at(2026, 8, 10) },
    { symptom: 'backache', timestamp: at(2026, 8, 10) },
    { symptom: 'cramps', timestamp: at(2026, 8, 19, 9) },
    { symptom: 'fatigue', timestamp: at(2026, 8, 19, 9, 1) },
  ];

  it('returns only the most recent day, newest first', () => {
    expect(getLastLoggedValues(logs, (l) => l.symptom)).toEqual([
      'fatigue',
      'cramps',
    ]);
  });

  it('de-duplicates repeats within that day', () => {
    expect(
      getLastLoggedValues(
        [
          { symptom: 'cramps', timestamp: at(2026, 8, 19, 9) },
          { symptom: 'cramps', timestamp: at(2026, 8, 19, 20) },
        ],
        (l) => l.symptom
      )
    ).toEqual(['cramps']);
  });

  it('treats entries either side of midnight as different days', () => {
    expect(
      getLastLoggedValues(
        [
          { symptom: 'a', timestamp: at(2026, 8, 19, 23, 59) },
          { symptom: 'b', timestamp: at(2026, 8, 20, 0, 1) },
        ],
        (l) => l.symptom
      )
    ).toEqual(['b']);
  });

  it.each([[[]], [undefined]])('returns [] for %s', (input) => {
    expect(getLastLoggedValues(input as never, (l: any) => l.symptom)).toEqual([]);
  });
});

describe('getMostRecentMoodLog / getRecentSymptoms', () => {
  const moods = [
    { mood: 'sad', timestamp: at(2026, 8, 10) },
    { mood: 'calm', timestamp: at(2026, 8, 19) },
  ];

  it('returns the newest mood with its timestamp', () => {
    expect(getMostRecentMoodLog(moods)?.mood).toBe('calm');
  });

  it('returns null for an empty log', () => {
    expect(getMostRecentMoodLog([])).toBeNull();
  });

  it('de-duplicates symptoms newest-first and honours the limit', () => {
    const many = ['cramps', 'fatigue', 'bloating'].map((s, i) => ({
      symptom: s,
      timestamp: at(2026, 8, 10 + i),
    }));
    expect(getRecentSymptoms([...many, ...many], Number.POSITIVE_INFINITY)).toEqual([
      'bloating',
      'fatigue',
      'cramps',
    ]);
    expect(getRecentSymptoms(many, 2)).toHaveLength(2);
  });
});

describe('getLastLoggedValues across a UTC day boundary', () => {
  // The server sends a window, never "today" — a local day in EAT (UTC+3)
  // straddles two UTC days, so anything grouping by UTC would split it. This is
  // the guard for that: the two entries below are 01:00 and 10:00 on the same
  // local morning, but sit either side of midnight UTC.
  const withTZ = (offsetMinutes: number, run: () => void) => {
    const RealDate = Date;
    // Only getTimezoneOffset and setHours care about the zone here.
    const shift = offsetMinutes * 60 * 1000;
    class TZDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(...args);
      }
      override getTimezoneOffset() {
        return -offsetMinutes;
      }
      override setHours(h: number, m = 0, s = 0, ms = 0) {
        // Midnight *local*, expressed as a UTC instant.
        const local = this.getTime() + shift;
        const dayStart = Math.floor(local / 86400000) * 86400000;
        const at = dayStart + h * 3600000 + m * 60000 + s * 1000 + ms - shift;
        return super.setTime(at);
      }
    }
    (globalThis as { Date: DateConstructor }).Date = TZDate as DateConstructor;
    try {
      run();
    } finally {
      (globalThis as { Date: DateConstructor }).Date = RealDate;
    }
  };

  it('keeps both halves of one local day that spans two UTC days', () => {
    withTZ(180, () => {
      const logs = [
        // 01:00 EAT on the 23rd == 22:00 UTC on the 22nd
        { mood: 'calm', timestamp: '2026-09-22T22:00:00.000Z' },
        // 10:00 EAT on the 23rd == 07:00 UTC on the 23rd
        { mood: 'happy', timestamp: '2026-09-23T07:00:00.000Z' },
      ];
      const values = getLastLoggedValues(logs, (l) => l.mood);
      expect(values.sort()).toEqual(['calm', 'happy']);
    });
  });

  it('still excludes the previous local day', () => {
    withTZ(180, () => {
      const logs = [
        { mood: 'old', timestamp: '2026-09-21T07:00:00.000Z' },
        { mood: 'new', timestamp: '2026-09-23T07:00:00.000Z' },
      ];
      expect(getLastLoggedValues(logs, (l) => l.mood)).toEqual(['new']);
    });
  });

  // Control. The same two timestamps genuinely fall on different days in UTC,
  // so this must return only the later one. If it returned both, the timezone
  // shim above would not be doing anything and the test either side of it
  // would be passing for the wrong reason.
  it('treats them as two days when the device is on UTC', () => {
    withTZ(0, () => {
      const logs = [
        { mood: 'calm', timestamp: '2026-09-22T22:00:00.000Z' },
        { mood: 'happy', timestamp: '2026-09-23T07:00:00.000Z' },
      ];
      expect(getLastLoggedValues(logs, (l) => l.mood)).toEqual(['happy']);
    });
  });
});

describe('getDayFromPoint', () => {
  const R = 120;
  const C = 180;
  const hit = (x: number, y: number, days = 30) =>
    getDayFromPoint(x, y, days, C, C, 50, R + 36);

  it('maps 12 o\'clock to day 1', () => {
    expect(hit(C, C - R)).toBe(1);
  });

  it('maps 3 o\'clock to a quarter of the way round', () => {
    expect(hit(C + R, C, 28)).toBe(8);
  });

  it('round-trips every day drawn on the ring', () => {
    for (const days of [28, 29, 30, 31]) {
      for (let day = 1; day <= days; day++) {
        const { x, y } = getCircularCoordinates(day, days, R, C, C);
        expect(hit(x, y, days)).toBe(day);
      }
    }
  });

  it('wraps a tap just left of 12 o\'clock to day 1, not day 31', () => {
    expect(hit(C - 2, C - R, 30)).toBe(1);
  });

  it('ignores taps in the centre or outside the ring', () => {
    expect(hit(C, C)).toBeNull();
    expect(hit(C + 20, C - 20)).toBeNull();
    expect(hit(C, C - R - 60)).toBeNull();
  });
});

describe('toISODateString', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toISODateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('getPeriodLengthDays', () => {
  it('counts both the first and last day', () => {
    expect(getPeriodLengthDays('2026-09-10', '2026-09-10')).toBe(1);
    expect(getPeriodLengthDays('2026-09-10', '2026-09-14')).toBe(5);
  });

  it('counts across a month boundary', () => {
    expect(getPeriodLengthDays('2026-08-29', '2026-09-03')).toBe(6);
  });
});

describe('buildPeriodStartUpdate', () => {
  const NOW_ISO = NOW.toISOString();

  it('sets the start and logs it', () => {
    expect(buildPeriodStartUpdate('2026-09-10', undefined, NOW)).toEqual({
      prev_cycle_start_date: '2026-09-10',
      period_start_logs: [{ date: '2026-09-10', timestamp: NOW_ISO }],
    });
  });

  it('keeps an end still after the new start and re-measures the length', () => {
    const update = buildPeriodStartUpdate('2026-09-10', '2026-09-14', NOW);
    expect(update).not.toHaveProperty('prev_period_end_date');
    expect(update.avg_period_length_days).toBe(5);
  });

  it('clears an end on or before the new start', () => {
    expect(buildPeriodStartUpdate('2026-09-14', '2026-09-14', NOW).prev_period_end_date).toBe('');
    expect(buildPeriodStartUpdate('2026-09-20', '2026-09-14', NOW).prev_period_end_date).toBe('');
  });

  it('clears an end too far after the new start to be the same period', () => {
    const update = buildPeriodStartUpdate('2026-08-01', '2026-09-14', NOW);
    expect(update.prev_period_end_date).toBe('');
    expect(update).not.toHaveProperty('avg_period_length_days');
  });
});

describe('buildPeriodLengthUpdate', () => {
  // NOW is 2026-09-21.
  it('moves the last day to match the length and logs it', () => {
    expect(buildPeriodLengthUpdate('2026-09-10', 5, '2026-09-12', NOW)).toEqual({
      avg_period_length_days: 5,
      prev_period_end_date: '2026-09-14',
      period_end_logs: [{ date: '2026-09-14', timestamp: NOW.toISOString() }],
    });
  });

  it('does not re-log an end that has not moved', () => {
    expect(buildPeriodLengthUpdate('2026-09-10', 5, '2026-09-14', NOW)).toEqual({
      avg_period_length_days: 5,
    });
  });

  it('allows an end of today', () => {
    expect(buildPeriodLengthUpdate('2026-09-17', 5, undefined, NOW).prev_period_end_date).toBe(
      '2026-09-21'
    );
  });

  it('never sets a future end: clears a stored one instead', () => {
    expect(buildPeriodLengthUpdate('2026-09-18', 7, '2026-09-19', NOW)).toEqual({
      avg_period_length_days: 7,
      prev_period_end_date: '',
    });
    expect(buildPeriodLengthUpdate('2026-09-18', 7, undefined, NOW)).toEqual({
      avg_period_length_days: 7,
    });
  });
});

describe('buildPeriodEndUpdate', () => {
  it('sets the end, the period length, and logs it', () => {
    expect(buildPeriodEndUpdate('2026-09-10', '2026-09-14', NOW)).toEqual({
      prev_period_end_date: '2026-09-14',
      avg_period_length_days: 5,
      period_end_logs: [{ date: '2026-09-14', timestamp: NOW.toISOString() }],
    });
  });
});

describe('calculateCycleData', () => {
  // NOW is 2026-09-21. Period began 2026-09-10, 28-day cycles, 5-day periods,
  // so later starts fall on Oct 8, Nov 5, Dec 3.
  const data = (month: number, year = 2026) =>
    calculateCycleData('2026-09-10', 28, 5, month, year, NOW);

  it('draws the current period as period days', () => {
    expect(data(8).periodDays).toEqual([10, 11, 12, 13, 14]);
    expect(data(8).predictedDays).toEqual([]);
  });

  it('predicts next month, which the ring could not show before', () => {
    expect(data(9).predictedDays).toEqual([8, 9, 10, 11, 12]);
    expect(data(9).periodDays).toEqual([]);
  });

  it('predicts months further ahead too', () => {
    expect(data(11).predictedDays).toEqual([3, 4, 5, 6, 7, 31]);
  });

  it('shows fertility and ovulation for future cycles', () => {
    // The cycle starting Oct 8 ovulates Nov 5 − 14 = Oct 22.
    expect(data(9).ovulationDays).toContain(22);
    expect(data(9).fertilityDays).toEqual(expect.arrayContaining([17, 18, 19, 20, 21, 23]));
  });

  it('draws nothing before the stored start', () => {
    const aug = data(7);
    expect(aug.periodDays).toEqual([]);
    expect(aug.predictedDays).toEqual([]);
  });

  it('keeps the next-period summary relative to today, whatever month is shown', () => {
    expect(data(11).daysUntilPeriod).toBe(data(8).daysUntilPeriod);
    expect(data(11).nextPeriodDate).toEqual(new Date(2026, 9, 8));
  });
});

describe('calculateCycleData accuracy', () => {
  const now = new Date(2026, 8, 21, 9);

  it('numbers each day from its own period start, even one begun last month', () => {
    const sep = calculateCycleData('2026-08-30', 28, 5, 8, 2026, now);
    expect(sep.periodDays).toEqual([1, 2, 3]);
    expect([1, 2, 3].map((d) => sep.dayOfPeriod[d])).toEqual([3, 4, 5]);
  });

  it('restarts the numbering for a second period in the same month', () => {
    const dec = calculateCycleData('2026-09-10', 28, 5, 11, 2026, now);
    expect(dec.dayOfPeriod[3]).toBe(1);
    expect(dec.dayOfPeriod[7]).toBe(5);
    expect(dec.dayOfPeriod[31]).toBe(1);
  });

  it('draws only the logged cycle as period days; projected past cycles are predicted', () => {
    // Logged 2026-07-16; Aug 13 and Sep 10 are projections.
    const sep = calculateCycleData('2026-07-16', 28, 5, 8, 2026, now);
    expect(sep.periodDays).toEqual([]);
    expect(sep.predictedDays).toEqual([10, 11, 12, 13, 14]);
    const jul = calculateCycleData('2026-07-16', 28, 5, 6, 2026, now);
    expect(jul.periodDays).toEqual([16, 17, 18, 19, 20]);
  });

  it('shows the next ovulation and fertile window once this cycle’s have passed', () => {
    // Cycle began Sep 10: ovulation Sep 24, window Sep 19–25. On Sep 21 the
    // window is under way; on Sep 27 both are over and move to the next cycle.
    const during = calculateCycleData('2026-09-10', 28, 5, 8, 2026, now);
    expect(during.ovulationDate).toEqual(new Date(2026, 8, 24));
    expect(during.fertilityWindow).toEqual({
      start: new Date(2026, 8, 19),
      end: new Date(2026, 8, 25),
    });
    const after = calculateCycleData('2026-09-10', 28, 5, 8, 2026, new Date(2026, 8, 27, 9));
    expect(after.ovulationDate).toEqual(new Date(2026, 9, 22));
    expect(after.fertilityWindow.start).toEqual(new Date(2026, 9, 17));
  });

  it('keeps fertile days that fall inside a short-cycle period', () => {
    const short = calculateCycleData('2026-09-10', 21, 7, 8, 2026, now);
    expect(short.periodDays).toEqual([10, 11, 12, 13, 14, 15, 16]);
    expect(short.fertilityDays).toEqual(expect.arrayContaining([12, 13, 14, 15, 16]));
  });
});

describe.each(['America/New_York', 'Europe/London', 'Africa/Nairobi'])(
  'dates in %s',
  (tz) => {
    const original = process.env.TZ;
    beforeAll(() => {
      process.env.TZ = tz;
    });
    afterAll(() => {
      process.env.TZ = original;
    });

    it('draws a stored date on that day, not the day before', () => {
      const d = calculateCycleData('2026-09-10', 28, 5, 8, 2026, new Date(2026, 8, 21, 9));
      expect(d.periodDays).toEqual([10, 11, 12, 13, 14]);
    });

    it('starts the next cycle exactly one cycle later across a clock change', () => {
      // London and New York both change clocks in March 2026.
      expect(getMostRecentCycleStart('2026-03-20', 28, new Date(2026, 3, 17, 9))).toEqual(
        new Date(2026, 3, 17)
      );
      expect(getMostRecentCycleStart('2026-03-20', 28, new Date(2026, 3, 16, 9))).toEqual(
        new Date(2026, 2, 20)
      );
    });

    it('counts days to the next period across a clock change', () => {
      expect(getDaysUntilPeriod(new Date(2026, 3, 17), new Date(2026, 2, 20, 23))).toBe(28);
    });
  }
);

describe('history rows', () => {
  it('formats a day as DD/MM', () => {
    expect(formatShortDate(new Date(2026, 8, 5))).toBe('05/09');
  });

  it('lays out a finished cycle from its own lengths', () => {
    const row = buildHistoryRow(
      { start_date: '2026-08-26', end_date: '2026-08-31', cycle_length_days: 25 },
      30,
      6,
      NOW
    );
    expect(row).toMatchObject({
      periodDays: 6,
      periodEstimated: false,
      cycleLength: 25,
      barDays: 25,
      // Ovulation 14 days before the next start, fertile 5 before to 1 after.
      ovulationDay: 11,
      fertileStartDay: 6,
      fertileEndDay: 12,
      todayDay: null,
      isCurrent: false,
    });
  });

  it('draws the current cycle to its predicted end, with today marked', () => {
    const row = buildHistoryRow(
      { start_date: '2026-09-20', end_date: null, cycle_length_days: null },
      30,
      6,
      NOW
    );
    expect(row).toMatchObject({
      periodDays: 6,
      periodEstimated: true,
      cycleLength: null,
      barDays: 30,
      ovulationDay: 16,
      todayDay: 1,
      isCurrent: true,
    });
  });

  it('leaves today unmarked once the current cycle runs past its prediction', () => {
    const row = buildHistoryRow(
      { start_date: '2026-07-01', end_date: null, cycle_length_days: null },
      28,
      5,
      NOW
    );
    expect(row.todayDay).toBeNull();
  });
});
