/**
 * Design tokens for the mobile app.
 *
 * Before this file the app carried 712 hardcoded hex literals across 89
 * distinct colours, including ten near-identical "brand pinks" that had drifted
 * apart per-flow. Every value here is checked against WCAG 2.1 on each surface
 * it is actually used on; the ratios in the comments are measured, not
 * aspirational.
 *
 * The rule that matters: `brand.base` is a FILL. It is 3.03:1 against white,
 * which only clears AA for large text (>=18pt, or >=14pt bold). Never put
 * normal-size white text on it, and never use it for text on a light surface —
 * that is what `brand.text` and `brand.onTint` are for.
 */

export const colors = {
  /**
   * One hue (~345), desaturating as it lightens — the way a native palette is
   * built. Previously every brand token sat at 98-100% saturation, which made
   * tinted surfaces read as candy, and the fill (#FD5A7E) and the text colour
   * (#C2003F) were far enough apart to look like two different brands.
   */
  brand: {
    /** Primary fill. White on it is 4.13:1, up from 3.03:1. */
    base: '#E23D63',
    /** Darker fill where a normal-size white label is needed (5.36:1). */
    strong: '#C82B50',
    pressed: '#C82B50',
    /** Brand-coloured TEXT on neutral surfaces (>=6.26:1). */
    text: '#A81E40',
    /** Brand-coloured TEXT on a brand tint (>=7.67:1). */
    onTint: '#6E1029',
  },

  surface: {
    /**
     * A soft blush on the brand hue (~342). This was a 100%-saturated cream at
     * hue 14 — an orange that fought the pink UI — then a neutral grey, which
     * read as flat. Half-saturated so it reads as pink without tinting the UI;
     * white cards still separate from it (1.12:1), and every text, border and
     * state colour keeps its AA ratio on it (see theme.spec.ts) — state.success
     * is the tightest, at 4.54:1.
     */
    app: '#FAF0F3',
    card: '#FFFFFF',
    muted: '#EFEFF2',
    /** Brand tints, for callouts and selected chips. */
    tint: '#FFE0E7',
    tintStrong: '#F7C2CE',
  },

  text: {
    primary: '#1C1C1E',
    secondary: '#55555C',
    /** Lightest grey that still clears 4.5:1 on every surface we use. */
    muted: '#6B6B73',
    placeholder: '#6B6B73',
    inverse: '#FFFFFF',
  },

  border: {
    /**
     * Neutral control boundary: >=3.07:1 on every surface (SC 1.4.11).
     * iOS systemGray cleared 3:1 on the old cream but not on the lighter
     * neutral canvas, so this is a step darker.
     */
    default: '#88888D',
    /** Brand boundary for focus and selection only, >=3.01:1. */
    brand: '#E25C7B',
    /** Decorative hairlines — list separators, never a control boundary. */
    subtle: '#D8D8DC',
    focus: '#A81E40',
    error: '#B3261E',
  },

  /**
   * Bottom tab bar. Active and inactive differ in LUMINANCE, not just hue:
   * the old pair sat 1.11:1 apart, this one 2.20:1. The SF Symbols also swap
   * outline/filled, so selection is never colour-only.
   */
  nav: {
    active: '#A81E40',
    inactive: '#8E8E93',
  },

  /** Disabled controls keep a visible label rather than white-on-pale-pink. */
  disabled: {
    fill: '#F0D4DB',
    text: '#5C1F30',
  },

  state: {
    error: '#B3261E',
    success: '#1B7F3B',
    warning: '#8A5300',
    info: '#0B6E8F',
  },

  cycle: {
    period: '#C82B50',
    predicted: '#E23D63',
    ovulation: '#9C27B0',
    fertile: '#00796B',
  },
} as const;

/**
 * Symptom icon colours.
 *
 * The originals were Tailwind-500 values picked for white backgrounds; on the
 * grey chip the amber sat at 1.97:1 and the green at 2.33:1, so the icon
 * effectively disappeared next to its own label. These all clear 4.2:1 on both
 * the chip and a card.
 */
export const symptomColors = {
  cramps: '#B45309',
  fatigue: '#7C3AED',
  bloating: '#2563EB',
  tender_breast: '#DB2777',
  backache: '#DC2626',
  headache: '#047857',
} as const;

/**
 * The three control tiers.
 *
 * Eleven screens each hand-rolled their own primary button with slightly
 * different padding, radius and shadow, and there was effectively no secondary
 * tier — one outline button in the whole app — so "save" and "cancel" carried
 * the same visual weight. Spread these instead of redefining them.
 *
 *   primary   — the one action the screen exists for. Brand fill.
 *   secondary — a real alternative. Outline, no fill.
 *   tertiary  — low-commitment or dismissive. Text only.
 *   destructive — irreversible. Reads as a warning, not as primary.
 */
export const controls = {
  primary: {
    backgroundColor: colors.brand.base,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: { color: colors.text.inverse },

  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand.base,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: { color: colors.brand.text },

  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryLabel: { color: colors.brand.text },

  destructive: {
    backgroundColor: colors.state.error,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveLabel: { color: colors.text.inverse },

  disabled: {
    backgroundColor: colors.disabled.fill,
    borderColor: colors.disabled.fill,
  },
  disabledLabel: { color: colors.disabled.text },
} as const;

/**
 * Surface recipes.
 *
 * The app had 43 drop shadows with Android elevation 2-5 — Material Design
 * cards, which read as distinctly non-native on iOS. Apple's grouped content
 * uses no shadow at all: a white card on a tinted background, separated by the
 * background showing through, with a ~12pt radius. `elevated` exists for the
 * rare thing that genuinely floats above the page.
 */
export const surfaces = {
  /** Default card: grouped-list style, no shadow. */
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
  },
  /** Card on a surface too close in tone to separate on its own. */
  cardOutlined: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  /** Genuinely floating: a sheet or a menu, not a list row. */
  elevated: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  /** Capsule, for chips and pills. */
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
} as const;

/**
 * The smallest a tappable thing may be.
 *
 * 44pt is the iOS Human Interface Guidelines floor and close enough to
 * Material's 48dp to serve both. Controls that cannot reach it by their own
 * geometry — an icon on its own, typically — make up the difference with
 * `hitSlop`, which enlarges the touch rect without changing the layout.
 */
export const TOUCH_TARGET = 44;


/**
 * Text field geometry.
 *
 * Fields were sized ad hoc: `paddingVertical` of 12, 13, 16 and 4 across the
 * app, none of them declaring a minimum height. That put the country search at
 * roughly 32pt — under the touch floor — while change-pin sat at 56pt, so no
 * two forms agreed on how tall an input was.
 */
export const fields = {
  base: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  /** Inline affordances, such as a search box inside a sheet. */
  compact: {
    minHeight: TOUCH_TARGET,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;
/**
 * Page geometry.
 *
 * These three settings screens each invented their own: the gutter was 20 in
 * the content but 16 in the header, cards were padded 16 in two screens and 10
 * in the third, and vertical gaps ran 5, 10, 12, 20, 24, 30 and 32 — most of
 * them off the spacing scale entirely. A card's own padding and radius come
 * from `surfaces`; this is the space around them.
 */
export const layout = {
  /** Screen edge to content, header and body alike. */
  screenGutter: 20,
  /** Between sibling sections down a page. */
  sectionGap: spacing.md,
  /**
   * Between stacked fields in a form.
   *
   * Wider than `sectionGap` on purpose: a field is a label, a box and
   * sometimes an error message, so neighbouring fields need more air between
   * them than two paragraphs do or the error under one reads as the label of
   * the next. Every form used to pick its own value — 20 here, a 20px
   * `marginBottom` there, nothing at all on two of them.
   */
  fieldGap: spacing.lg,
} as const;
