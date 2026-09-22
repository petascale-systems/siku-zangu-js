import {
  parseLoggedAt,
  selectedFromLogs,
  userLogsToRows,
} from '../user-log.function';
import { kvLogsToRows } from '../kv-logs-to-rows.function';

const NOW = Date.parse('2026-09-22T10:00:00.000Z');
const iso = (s: string) => new Date(s).toISOString();

describe('userLogsToRows', () => {
  it('turns each entry into a row of its own kind', () => {
    const rows = userLogsToRows(
      {
        symptom_logs: [{ symptom: 'cramps', timestamp: iso('2026-09-22T09:00:00Z') }],
        mood_logs: [{ mood: 'happy', timestamp: iso('2026-09-22T09:00:00Z') }],
      },
      NOW
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.kind).sort()).toEqual(['mood', 'symptom']);
  });

  it('writes nothing for a key the body does not mention', () => {
    expect(userLogsToRows({}, NOW)).toEqual([]);
  });

  // "No symptoms today" and "did not open the app today" are different facts,
  // and only an explicit row can tell them apart in the history.
  it('records an empty array as a clearing event', () => {
    const rows = userLogsToRows({ medication_logs: [] }, NOW);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'medication', cleared: true });
    // There is no entry to take a timestamp from, so the clear uses the clock.
    expect(rows[0].logged_at.getTime()).toBe(NOW);
  });

  it('marks real entries as not cleared', () => {
    const rows = userLogsToRows(
      { mood_logs: [{ mood: 'happy', timestamp: iso('2026-09-22T09:00:00Z') }] },
      NOW
    );
    expect(rows[0].cleared).toBe(false);
  });

  it('drops entries with no value or an unusable timestamp', () => {
    const rows = userLogsToRows(
      {
        symptom_logs: [
          { symptom: '', timestamp: iso('2026-09-22T09:00:00Z') },
          { symptom: 'cramps', timestamp: 'not a date' },
          { symptom: 'cramps', timestamp: iso('2026-09-22T09:00:00Z') },
        ] as never,
      },
      NOW
    );
    expect(rows).toHaveLength(1);
  });

  it('truncates an over-long value to the column width', () => {
    const rows = userLogsToRows(
      {
        symptom_logs: [
          { symptom: 'x'.repeat(200), timestamp: iso('2026-09-22T09:00:00Z') },
        ],
      },
      NOW
    );
    expect(rows[0].value).toHaveLength(64);
  });
});

describe('parseLoggedAt', () => {
  it('keeps a plausible client timestamp, to the millisecond', () => {
    const at = parseLoggedAt('2026-09-22T09:00:00.123Z', NOW);
    expect(at?.toISOString()).toBe('2026-09-22T09:00:00.123Z');
  });

  // Millisecond fidelity is what makes a re-sent entry collide with the unique
  // index instead of duplicating.
  it('does not round away milliseconds', () => {
    const a = parseLoggedAt('2026-09-22T09:00:00.100Z', NOW);
    const b = parseLoggedAt('2026-09-22T09:00:00.900Z', NOW);
    expect(a?.getTime()).not.toBe(b?.getTime());
  });

  it('rejects a clock running far ahead', () => {
    expect(parseLoggedAt('2026-09-23T10:00:00Z', NOW)).toBeNull();
  });

  it('rejects a timestamp older than any real history', () => {
    expect(parseLoggedAt('2001-01-01T00:00:00Z', NOW)).toBeNull();
  });

  it('allows a small amount of clock skew', () => {
    expect(parseLoggedAt('2026-09-22T10:02:00Z', NOW)).not.toBeNull();
  });
});



describe('kvLogsToRows', () => {
  it('converts stored kv history into rows', () => {
    const out = kvLogsToRows({
      symptom_logs: JSON.stringify([
        { symptom: 'cramps', timestamp: '2026-09-20T09:00:00.000Z' },
      ]),
      mood_logs: JSON.stringify([
        { mood: 'happy', timestamp: '2026-09-20T09:00:00.000Z' },
      ]),
    });
    expect(out.rows).toHaveLength(2);
    expect(out.unparseable).toBe(0);
  });

  // The varchar(4096) ceiling truncates mid-JSON. Those values cannot be
  // recovered; the migration counts them rather than reporting a clean run.
  it('counts a truncated value instead of throwing', () => {
    const out = kvLogsToRows({
      symptom_logs: '[{"symptom":"cramps","timestamp":"2026-09-2',
    });
    expect(out.rows).toHaveLength(0);
    expect(out.unparseable).toBe(1);
  });

  it('keeps genuinely old history that the live path would clamp away', () => {
    const out = kvLogsToRows({
      mood_logs: JSON.stringify([
        { mood: 'happy', timestamp: '2021-01-01T00:00:00.000Z' },
      ]),
    });
    expect(out.rows).toHaveLength(1);
  });

  it('reports entries it had to skip', () => {
    const out = kvLogsToRows({
      mood_logs: JSON.stringify([
        { mood: 'happy' },
        { timestamp: '2026-09-20T09:00:00.000Z' },
      ]),
    });
    expect(out.rows).toHaveLength(0);
    expect(out.skipped).toBe(2);
  });

  it('ignores a key that holds no history', () => {
    expect(kvLogsToRows({ symptom_logs: null }).rows).toHaveLength(0);
    expect(kvLogsToRows({}).rows).toHaveLength(0);
  });
});

describe('selectedFromLogs', () => {
  it('makes what was just logged the current selection', () => {
    const next = selectedFromLogs({
      symptom_logs: [{ symptom: 'cramps', timestamp: iso('2026-09-22T09:00:00Z') }],
      mood_logs: [{ mood: 'happy', timestamp: iso('2026-09-22T09:00:00Z') }],
    });
    expect(next.selected_symptoms).toEqual(['cramps']);
    expect(next.selected_moods).toEqual(['happy']);
  });

  it('leaves a kind alone when the body does not mention it', () => {
    const next = selectedFromLogs({
      mood_logs: [{ mood: 'happy', timestamp: iso('2026-09-22T09:00:00Z') }],
    });
    expect(next).not.toHaveProperty('selected_symptoms');
    expect(next).not.toHaveProperty('selected_medications');
  });

  // The regression this rule exists for: a user logging a day with no
  // medication sends an empty array, and clearing selected_medications would
  // switch her medication reminders off permanently and silently.
  // The user unticked everything; "none" is what they meant.
  it('clears the selection when the array is empty', () => {
    const next = selectedFromLogs({ medication_logs: [] });
    expect(next.selected_medications).toEqual([]);
  });

  // Only an absent key leaves a kind alone — that distinction is load-bearing.
  it('still leaves a kind alone when the body omits it', () => {
    const next = selectedFromLogs({ mood_logs: [] });
    expect(next).not.toHaveProperty('selected_medications');
    expect(next.selected_moods).toEqual([]);
  });

  // A submission is the whole set for that moment, so unticking an item is how
  // a user drops it. Merging would make a symptom impossible to stop reporting.
  it('replaces the set, so an omitted value is dropped', () => {
    const next = selectedFromLogs({
      symptom_logs: [
        { symptom: 'fatigue', timestamp: iso('2026-09-22T18:00:00Z') },
      ],
    });
    expect(next.selected_symptoms).toEqual(['fatigue']);
  });

  it('records several values logged at the same moment', () => {
    const next = selectedFromLogs({
      symptom_logs: [
        { symptom: 'fatigue', timestamp: iso('2026-09-22T09:00:00Z') },
        { symptom: 'tired', timestamp: iso('2026-09-22T09:00:00Z') },
      ],
    });
    expect(next.selected_symptoms?.sort()).toEqual(['fatigue', 'tired']);
  });

  it('does not repeat a value logged twice in one save', () => {
    const next = selectedFromLogs({
      symptom_logs: [
        { symptom: 'cramps', timestamp: iso('2026-09-22T09:00:00Z') },
        { symptom: 'cramps', timestamp: iso('2026-09-22T09:00:01Z') },
      ],
    });
    expect(next.selected_symptoms).toEqual(['cramps']);
  });
});
