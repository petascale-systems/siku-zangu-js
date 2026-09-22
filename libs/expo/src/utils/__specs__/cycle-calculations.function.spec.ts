import {
  CYCLE_LENGTH_OPTIONS,
  PERIOD_LENGTH_OPTIONS,
  formatRelativeLogDate,
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
