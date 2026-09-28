/**
 * One cycle in a user's period history, as `GET /api/users/:id/period-history`
 * returns it, newest first.
 */
export type PeriodHistoryCycle = {
    /** First day of the period that opened this cycle (YYYY-MM-DD). */
    start_date: string;
    /** Last day of that period, if one was logged (YYYY-MM-DD). */
    end_date: string | null;
    /** Days from this start to the next one. Null for the current cycle, which has not ended. */
    cycle_length_days: number | null;
};
