import { TextStyle } from 'react-native';

/**
 * Type scale for the mobile app.
 *
 * Replaces 238 ad-hoc `fontSize` declarations spread over 14 sizes (10, 11,
 * 11.5, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32) where only 31 declared
 * a `lineHeight` at all. Near-duplicates that served the same role — 13 vs 14
 * for captions, 15 vs 16 for card headings — are collapsed here.
 *
 * `lineHeight` is part of every step on purpose: it was the single most
 * commonly forgotten property, and omitting it is what made multi-line body
 * copy and Swahili strings (typically 1.3-1.6x longer than English) collide.
 *
 * Nothing is smaller than 12pt. The old 10/11/11.5pt labels were below the iOS
 * HIG floor and several of them carried real data, not decoration.
 */

/**
 * No `fontFamily` anywhere, deliberately.
 *
 * React Native falls back to the platform UI font — San Francisco on iOS,
 * Roboto on Android — which is what makes text feel native: correct optical
 * sizing, the user's Dynamic Type settings, and the same face as every system
 * control around it. The app previously shipped Inter and Poppins, which read
 * as a web app on a phone.
 *
 * Set `fontWeight` and let the system pick the face. Do not reintroduce a
 * `fontFamily`; a bundled face also has to be loaded before first paint and
 * silently falls back when it is not.
 */

/**
 * Each step carries a size, its matching lineHeight, and a sensible default
 * weight. The weight is only a default — spread the step first and override it
 * where the design needs a different one:
 *
 *   { ...typography.caption, fontWeight: '600' }
 *
 * The scale is size-led rather than weight-led because the same size legitimately
 * appears at several weights (14pt shows up at 400, 500, 600 and 700), and
 * forcing one weight per size would have quietly restyled the app.
 */
const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const typography = {
  /** Hero numerals: the cycle-day readout, the length pickers. */
  display: { fontSize: 32, lineHeight: 40, fontWeight: weight.bold },
  /** Secondary hero numerals. */
  displaySm: { fontSize: 28, lineHeight: 36, fontWeight: weight.bold },
  /** Screen titles. */
  title: { fontSize: 24, lineHeight: 32, fontWeight: weight.bold },
  /** Compact screen titles. */
  titleSm: { fontSize: 22, lineHeight: 30, fontWeight: weight.bold },
  /** Section headings. */
  heading: { fontSize: 20, lineHeight: 28, fontWeight: weight.semibold },
  /** Compact section headings. */
  headingSm: { fontSize: 18, lineHeight: 26, fontWeight: weight.semibold },
  /** Card and list-row titles. */
  subheading: { fontSize: 16, lineHeight: 24, fontWeight: weight.semibold },
  /** Default body copy. */
  body: { fontSize: 16, lineHeight: 24, fontWeight: weight.regular },
  /** Secondary copy, row subtitles, helper text. */
  caption: { fontSize: 14, lineHeight: 20, fontWeight: weight.regular },
  /** Smallest permitted size: micro-labels, badges, timestamps. */
  label: { fontSize: 12, lineHeight: 16, fontWeight: weight.medium },
  /** Button labels. 16pt/700 counts as "large text" for contrast purposes. */
  button: { fontSize: 16, lineHeight: 24, fontWeight: weight.bold },
} satisfies Record<string, TextStyle>;

/**
 * Cap on OS font scaling for text in a constrained box (a ring readout, a chip).
 * Prefer letting text grow; reach for this only where growth would break layout,
 * and never use `allowFontScaling={false}`, which ignores the user outright.
 */
export const MAX_FONT_SCALE = 1.6;
