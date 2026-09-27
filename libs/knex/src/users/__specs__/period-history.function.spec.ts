import { logsToPeriodHistory, PeriodLogRow } from '../period-history.function';

let clock = Date.parse('2026-01-01T00:00:00Z');
/** Rows in the order they were marked, each a minute after the last. */
const mark = (kind: 'period_start' | 'period_end', value: string): PeriodLogRow => ({
  kind,
  value,
  logged_at: new Date((clock += 60_000)),
  cleared: false,
});
const start = (d: string) => mark('period_start', d);
const end = (d: string) => mark('period_end', d);

describe('logsToPeriodHistory', () => {
  it('returns cycles newest first with their lengths', () => {
    const rows = [
      start('2026-07-01'), end('2026-07-05'),
      start('2026-07-29'), end('2026-08-02'),
      start('2026-08-26'),
    ];
    expect(logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-08-26' })).toEqual([
      { start_date: '2026-08-26', end_date: null, cycle_length_days: null },
      { start_date: '2026-07-29', end_date: '2026-08-02', cycle_length_days: 28 },
      { start_date: '2026-07-01', end_date: '2026-07-05', cycle_length_days: 28 },
    ]);
  });

  it('treats a start re-marked within a period length as a correction', () => {
    const rows = [start('2026-07-01'), start('2026-07-03'), start('2026-07-31')];
    const cycles = logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-07-31' });
    expect(cycles.map((c) => c.start_date)).toEqual(['2026-07-31', '2026-07-03']);
    expect(cycles[1].cycle_length_days).toBe(28);
  });

  it('adds the kv start when no row carries it', () => {
    const cycles = logsToPeriodHistory([], { prev_cycle_start_date: '2026-09-20' });
    expect(cycles).toEqual([
      { start_date: '2026-09-20', end_date: null, cycle_length_days: null },
    ]);
  });

  it('drops logged starts after the kv start, which were taken back', () => {
    const rows = [start('2026-08-01'), start('2026-08-29'), start('2026-09-26')];
    const cycles = logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-08-29' });
    expect(cycles.map((c) => c.start_date)).toEqual(['2026-08-29', '2026-08-01']);
  });

  it('takes the current end from kv, and only when it follows the start', () => {
    const rows = [start('2026-09-20'), end('2026-09-24')];
    expect(
      logsToPeriodHistory(rows, {
        prev_cycle_start_date: '2026-09-20',
        prev_period_end_date: '2026-09-25',
      })[0].end_date
    ).toBe('2026-09-25');
    // Cleared in kv means the period is still under way, whatever was logged.
    expect(
      logsToPeriodHistory(rows, {
        prev_cycle_start_date: '2026-09-20',
        prev_period_end_date: '',
      })[0].end_date
    ).toBeNull();
    expect(
      logsToPeriodHistory(rows, {
        prev_cycle_start_date: '2026-09-20',
        prev_period_end_date: '2026-08-01',
      })[0].end_date
    ).toBeNull();
  });

  it('matches the latest-marked end that fits inside the period', () => {
    const rows = [
      start('2026-07-01'),
      end('2026-07-06'),
      end('2026-07-05'),
      // Too long to be this period's end.
      end('2026-07-20'),
      start('2026-07-30'),
    ];
    const cycles = logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-07-30' });
    expect(cycles[1].end_date).toBe('2026-07-05');
  });

  it('leaves the end null when none was logged', () => {
    const rows = [start('2026-07-01'), start('2026-07-30')];
    expect(
      logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-07-30' })[1].end_date
    ).toBeNull();
  });

  it('ignores cleared and malformed rows', () => {
    const rows = [
      { ...start('2026-07-01'), cleared: true },
      start('not-a-date'),
      start('2026-07-30'),
    ];
    expect(
      logsToPeriodHistory(rows, { prev_cycle_start_date: '2026-07-30' }).map((c) => c.start_date)
    ).toEqual(['2026-07-30']);
  });

  it('caps the result at the limit, keeping the newest', () => {
    const rows = ['2026-03-01', '2026-03-29', '2026-04-26', '2026-05-24'].map(start);
    const cycles = logsToPeriodHistory(rows, {}, 2);
    expect(cycles.map((c) => c.start_date)).toEqual(['2026-05-24', '2026-04-26']);
  });

  it('gives the newest start a null length when kv has no start', () => {
    const cycles = logsToPeriodHistory([start('2026-03-01'), start('2026-03-29')], {});
    expect(cycles[0]).toMatchObject({ start_date: '2026-03-29', cycle_length_days: null });
  });
});
