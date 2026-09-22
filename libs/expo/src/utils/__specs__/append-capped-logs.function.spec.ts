import {
  LOG_COLUMN_LIMIT,
  appendCappedLogs,
} from '../append-capped-logs.function';

type MoodLog = { mood: string; timestamp: string };

const moodLog = (n: number): MoodLog => ({
  mood: 'happy',
  timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, n)).toISOString(),
});

describe('appendCappedLogs', () => {
  it('appends when there is room', () => {
    const existing = [moodLog(1)];
    const result = appendCappedLogs(existing, [moodLog(2)]);
    expect(result).toHaveLength(2);
    expect(result[1].timestamp).toBe(moodLog(2).timestamp);
  });

  it('treats a missing array as empty', () => {
    expect(appendCappedLogs(undefined, [moodLog(1)])).toHaveLength(1);
  });

  it('tolerates a non-array, which is what a corrupt column parses to', () => {
    expect(
      appendCappedLogs('not an array' as unknown as MoodLog[], [moodLog(1)])
    ).toHaveLength(1);
  });

  // The whole point: the column is varchar(4096) and these arrays are
  // append-only, so without a cap the value is silently truncated on write and
  // then fails to parse on read.
  it('stays within the column limit no matter how many are added', () => {
    let logs: MoodLog[] = [];
    for (let i = 0; i < 500; i++) {
      logs = appendCappedLogs(logs, [moodLog(i)]);
      expect(JSON.stringify(logs).length).toBeLessThanOrEqual(LOG_COLUMN_LIMIT);
    }
  });

  it('drops the oldest entries, keeping the newest', () => {
    let logs: MoodLog[] = [];
    for (let i = 0; i < 400; i++) {
      logs = appendCappedLogs(logs, [moodLog(i)]);
    }
    expect(logs.length).toBeLessThan(400);
    // The final append must survive — that is the entry the user just made.
    expect(logs[logs.length - 1].timestamp).toBe(moodLog(399).timestamp);
    // And the very first must be long gone.
    expect(logs.some((l) => l.timestamp === moodLog(0).timestamp)).toBe(false);
  });

  it('still records a save whose batch alone is oversized', () => {
    const huge = Array.from({ length: 200 }, (_, i) => moodLog(i));
    const result = appendCappedLogs([moodLog(900)], huge);
    expect(result.length).toBeGreaterThan(0);
  });
});
