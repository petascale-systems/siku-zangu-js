import React, { useMemo, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NUICard } from './nui-card.component';
import { NUIPressable } from './nui-pressable.component';
import { colors, radius, spacing, TOUCH_TARGET } from './theme';
import { MAX_FONT_SCALE, typography } from './typography';
import { useLanguage, useTranslate } from './i18n';
import {
  buildHistoryRow,
  formatDate,
  formatShortDate,
  HistoryCycleInput,
  HistoryRow,
  MONTH_NAMES_EN,
  MONTH_NAMES_SW,
} from './utils';

/** Rows shown before "More". */
const COLLAPSED_ROWS = 3;

/**
 * The bar scale, in days. The longest visible cycle fills the row, so rows
 * compare at a glance, but never beyond these bounds: a months-long gap where a
 * period went unlogged would otherwise squash every other row to a sliver.
 */
const MIN_SCALE_DAYS = 28;
const MAX_SCALE_DAYS = 45;

const BAR_HEIGHT = 22;

/**
 * The empty state's preview rows, in percent: a hint of what the card will
 * hold, varied so it reads as history rather than a loading skeleton.
 */
const GHOST_ROWS = [
  { label: 30, bar: 92, period: 20, fertileLeft: 42, fertile: 24 },
  { label: 26, bar: 80, period: 24, fertileLeft: 38, fertile: 28 },
  { label: 32, bar: 86, period: 18, fertileLeft: 40, fertile: 26 },
];

/**
 * The period segment carries a white day count, so it takes the period token
 * (5.36:1 with white). Fertility and ovulation match the calendar legend.
 */
const PERIOD_FILL = colors.cycle.period;
const FERTILE_FILL = '#27B3B3';
const OVULATION_FILL = '#D245D2';

type Props = {
  cycles: HistoryCycleInput[];
  avgCycleLength: number;
  avgPeriodLength: number;
  /** Layout only. */
  style?: StyleProp<ViewStyle>;
  /** While the first fetch is in flight: the preview rows, without the message. */
  loading?: boolean;
  /** Injected for tests; defaults to now. */
  today?: Date;
};

const pct = (days: number, of: number) => `${Math.max(0, Math.min(100, (days / of) * 100))}%` as const;

/**
 * The period history: one bar per cycle, newest first — the period, the
 * fertile window with ovulation, and the rest of the cycle — with the cycle's
 * length alongside. The current cycle is drawn to its predicted end with today
 * marked, and has no length yet.
 */
export const NUIPeriodHistoryCard: React.FC<Props> = ({
  cycles,
  avgCycleLength,
  avgPeriodLength,
  style,
  loading = false,
  today,
}) => {
  const t = useTranslate();
  const language = useLanguage();
  const monthNames = language === 'sw' ? MONTH_NAMES_SW : MONTH_NAMES_EN;
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(
    () => cycles.map((c) => buildHistoryRow(c, avgCycleLength, avgPeriodLength, today)),
    [cycles, avgCycleLength, avgPeriodLength, today]
  );
  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
  const scaleDays = Math.min(
    MAX_SCALE_DAYS,
    Math.max(MIN_SCALE_DAYS, ...visible.map((r) => r.barDays))
  );
  const hasMore = rows.length > COLLAPSED_ROWS;
  const onlyCurrent = rows.length === 1 && rows[0].isCurrent;

  const a11yLabel = (row: HistoryRow) => {
    const period = row.periodEstimated
      ? `${t('calendar.period')} ${formatDate(row.start, monthNames)}.`
      : t('calendar.historyPeriodA11y', {
          from: formatDate(row.start, monthNames),
          to: formatDate(row.periodEnd, monthNames),
          days: row.periodDays,
        });
    const cycle =
      row.cycleLength === null
        ? t('calendar.historyCurrentA11y')
        : t('calendar.historyCycleA11y', { days: row.cycleLength });
    return `${period} ${cycle}`;
  };

  return (
    <NUICard padded={false} style={style}>
      <View style={styles.body}>
        <Text style={styles.title} accessibilityRole="header">
          {t('calendar.history')}
        </Text>
        {visible.map((row) => (
          <View
            key={row.start.getTime()}
            style={styles.row}
            accessible
            accessibilityLabel={a11yLabel(row)}
          >
            <View style={styles.rowHeader}>
              <Text style={styles.range} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {row.periodEstimated
                  ? formatShortDate(row.start)
                  : `${formatShortDate(row.start)} - ${formatShortDate(row.periodEnd)}`}
              </Text>
              {row.cycleLength !== null && (
                <Text style={styles.cycleLength} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {row.cycleLength}
                </Text>
              )}
            </View>
            <HistoryBar row={row} scaleDays={scaleDays} />
          </View>
        ))}
        {onlyCurrent && <Text style={styles.empty}>{t('calendar.historyEmpty')}</Text>}
        {rows.length === 0 && <HistoryPlaceholder loading={loading} />}
      </View>
      {hasMore && (
        <>
          <View style={styles.divider} />
          <NUIPressable
            style={styles.footer}
            onPress={() => setExpanded((e) => !e)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
          >
            <Text style={styles.footerText}>
              {expanded ? t('calendar.historyLess') : t('calendar.historyMore')}
            </Text>
          </NUIPressable>
        </>
      )}
    </NUICard>
  );
};

/**
 * Shown before any period is logged: faded preview bars, so the card's
 * purpose is clear, and a line on how to fill it.
 */
const HistoryPlaceholder: React.FC<{ loading: boolean }> = ({ loading }) => {
  const t = useTranslate();
  return (
    <View style={styles.placeholder}>
      <View
        style={styles.ghostRows}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {GHOST_ROWS.map((g, i) => (
          <View key={i} style={styles.row}>
            <View style={[styles.ghostLabel, { width: `${g.label}%` }]} />
            <View style={[styles.bar, { width: `${g.bar}%` }]}>
              <View
                style={[
                  styles.segment,
                  styles.ghostFertile,
                  { left: `${g.fertileLeft}%`, width: `${g.fertile}%` },
                ]}
              />
              <View style={[styles.segment, styles.ghostPeriod, { left: 0, width: `${g.period}%` }]} />
            </View>
          </View>
        ))}
      </View>
      {!loading && (
        <View style={styles.placeholderMessage}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="water-outline" size={22} color={colors.brand.text} />
          </View>
          <Text style={styles.placeholderTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('calendar.historyEmptyTitle')}
          </Text>
          <Text style={styles.placeholderBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('calendar.historyEmptyBody')}
          </Text>
        </View>
      )}
    </View>
  );
};

const HistoryBar: React.FC<{ row: HistoryRow; scaleDays: number }> = ({ row, scaleDays }) => {
  const of = row.barDays;
  // A prediction still ahead of today is drawn faintly, as on the calendar.
  const isAhead = (day: number) => row.isCurrent && row.todayDay !== null && day > row.todayDay;
  const fertileStart = Math.max(row.fertileStartDay, row.periodDays);
  const fertileDays = row.fertileEndDay + 1 - fertileStart;

  return (
    <View
      style={[styles.bar, { width: pct(Math.min(of, scaleDays), scaleDays) }]}
      importantForAccessibility="no-hide-descendants"
    >
      {fertileDays > 0 && (
        <View
          style={[
            styles.segment,
            styles.fertile,
            { left: pct(fertileStart, of), width: pct(fertileDays, of) },
            isAhead(fertileStart) && styles.predicted,
          ]}
        />
      )}
      {row.ovulationDay >= 0 && row.ovulationDay < of && (
        <View
          style={[
            styles.ovulation,
            { left: pct(row.ovulationDay + 0.5, of) },
            isAhead(row.ovulationDay) && styles.predicted,
          ]}
        />
      )}
      <View
        style={[
          styles.segment,
          styles.period,
          { left: 0, width: pct(row.periodDays, of) },
          row.periodEstimated && styles.predicted,
        ]}
      >
        {!row.periodEstimated && (
          <Text style={styles.periodCount} maxFontSizeMultiplier={1.2} numberOfLines={1}>
            {row.periodDays}
          </Text>
        )}
      </View>
      {row.todayDay !== null && (
        <View style={[styles.today, { left: pct(row.todayDay + 0.5, of) }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  row: {
    gap: spacing.xs + 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  range: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cycleLength: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.muted,
    // The today tick overhangs the bar, so nothing is clipped here; each
    // segment rounds its own ends instead.
  },
  segment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  period: {
    backgroundColor: PERIOD_FILL,
    minWidth: BAR_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  periodCount: {
    ...typography.label,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  fertile: {
    backgroundColor: FERTILE_FILL,
  },
  ovulation: {
    position: 'absolute',
    top: (BAR_HEIGHT - 14) / 2,
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.surface.card,
    backgroundColor: OVULATION_FILL,
  },
  predicted: {
    opacity: 0.45,
  },
  today: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 2,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: colors.text.primary,
  },
  placeholder: {
    gap: spacing.lg,
  },
  ghostRows: {
    gap: spacing.md,
  },
  ghostLabel: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface.muted,
  },
  ghostPeriod: {
    backgroundColor: colors.surface.tintStrong,
  },
  ghostFertile: {
    backgroundColor: colors.border.subtle,
  },
  placeholderMessage: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface.tint,
  },
  placeholderTitle: {
    ...typography.subheading,
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholderBody: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  empty: {
    ...typography.caption,
    color: colors.text.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
  },
  footer: {
    minHeight: TOUCH_TARGET + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    ...typography.button,
    fontWeight: '600',
    color: colors.brand.text,
  },
});
