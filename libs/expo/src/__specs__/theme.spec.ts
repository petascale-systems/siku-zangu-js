import { colors, controls, radius, spacing, symptomColors, TOUCH_TARGET, fields} from '../theme';
import { MAX_FONT_SCALE, typography } from '../typography';

/** WCAG 2.1 relative luminance. */
const luminance = (hex: string) => {
  const parts = hex.replace('#', '').match(/../g) as string[];
  const [r, g, b] = parts.map((p) => {
    const v = parseInt(p, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const LIGHT_SURFACES = [
  colors.surface.card,
  colors.surface.app,
  colors.surface.muted,
];
const PINK_TINTS = [colors.surface.tint, colors.surface.tintStrong];

describe('colour tokens meet WCAG AA', () => {
  // These are the guarantees the tokens exist to provide. If someone retunes a
  // colour, this fails rather than silently reintroducing unreadable text.
  describe.each([
    ['text.primary', colors.text.primary],
    ['text.secondary', colors.text.secondary],
    ['text.muted', colors.text.muted],
    ['brand.text', colors.brand.text],
  ])('%s on every light surface', (_name, fg) => {
    it.each(LIGHT_SURFACES)('clears 4.5:1 on %s', (bg) => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it.each(PINK_TINTS)('brand.onTint clears 4.5:1 on %s', (bg) => {
    expect(ratio(colors.brand.onTint, bg)).toBeGreaterThanOrEqual(4.5);
  });

  // The tints were originally only checked for brand.onTint, so nothing caught
  // that text.muted fails on them. Chips on a tint use text.secondary.
  it.each(PINK_TINTS)('text.primary and text.secondary clear 4.5:1 on %s', (bg) => {
    expect(ratio(colors.text.primary, bg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(colors.text.secondary, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(PINK_TINTS)('text.muted is NOT safe on %s', (bg) => {
    // Documented deliberately: muted is for neutral surfaces only.
    expect(ratio(colors.text.muted, bg)).toBeLessThan(4.5);
  });

  // A border has to be perceptible against the surface it delimits.
  it.each([colors.surface.card, colors.surface.app])(
    'border.brand clears 3:1 on %s',
    (bg) => {
      expect(ratio(colors.border.brand, bg)).toBeGreaterThanOrEqual(3);
    }
  );

  // Icons are non-text content: 3:1 (SC 1.4.11). The originals were Tailwind
  // 500s chosen for white and sat under 2.4:1 on the grey chip.
  it.each(Object.entries(symptomColors))(
    'symptom icon %s clears 3:1 on the chip and on a card',
    (_name, hex) => {
      expect(ratio(hex, colors.surface.muted)).toBeGreaterThanOrEqual(3);
      expect(ratio(hex, colors.surface.card)).toBeGreaterThanOrEqual(3);
    }
  );

  // brand.base is a FILL. It is ~3.03:1 on white, which only clears AA for
  // LARGE text — that is exactly why brand.text exists for body copy.
  it('brand.base carries white large text but not normal text', () => {
    const r = ratio(colors.text.inverse, colors.brand.base);
    expect(r).toBeGreaterThanOrEqual(3);
    expect(r).toBeLessThan(4.5);
  });

  it('brand.strong carries white text at any size', () => {
    expect(ratio(colors.text.inverse, colors.brand.strong)).toBeGreaterThanOrEqual(4.5);
  });

  // White on pale pink was 1.65:1 — the disabled label was invisible.
  it('disabled label is readable on the disabled fill', () => {
    expect(ratio(colors.disabled.text, colors.disabled.fill)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LIGHT_SURFACES)('border.default clears 3:1 on %s', (bg) => {
    expect(ratio(colors.border.default, bg)).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ['error', colors.state.error],
    ['success', colors.state.success],
    ['warning', colors.state.warning],
    ['info', colors.state.info],
  ])('state.%s is readable on card and app surfaces', (_n, fg) => {
    expect(ratio(fg, colors.surface.card)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(fg, colors.surface.app)).toBeGreaterThanOrEqual(4.5);
  });

  it('every token is a valid 6-digit hex', () => {
    const walk = (o: Record<string, unknown>): string[] =>
      Object.values(o).flatMap((v) =>
        typeof v === 'string' ? [v] : walk(v as Record<string, unknown>)
      );
    for (const value of walk(colors as unknown as Record<string, unknown>)) {
      expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('type scale', () => {
  const steps = Object.entries(typography);

  it('never goes below the 12pt floor', () => {
    for (const [, style] of steps) {
      expect(style.fontSize as number).toBeGreaterThanOrEqual(12);
    }
  });

  // lineHeight was the most commonly forgotten property; baking it into every
  // step is what stops it being omitted again.
  it('gives every step a lineHeight of at least 1.25x', () => {
    for (const [name, style] of steps) {
      const size = style.fontSize as number;
      const lh = style.lineHeight as number;
      expect(`${name}:${lh}`).not.toBe(`${name}:undefined`);
      expect(lh / size).toBeGreaterThanOrEqual(1.25);
    }
  });

  // The app must use the platform UI font (SF Pro / Roboto), so no step may
  // pin a bundled family.
  it('never pins a fontFamily', () => {
    for (const [name, style] of steps) {
      expect(`${name}:${(style as { fontFamily?: string }).fontFamily}`).toBe(
        `${name}:undefined`
      );
    }
  });

  it('uses numeric-string font weights, which Android honours', () => {
    for (const [, style] of steps) {
      expect(String(style.fontWeight)).toMatch(/^[1-9]00$/);
    }
  });

  it('caps font scaling rather than disabling it', () => {
    expect(MAX_FONT_SCALE).toBeGreaterThan(1);
  });
});

describe('control tiers', () => {
  it('gives every tier a 48pt target and a readable label', () => {
    for (const tier of ['primary', 'secondary', 'tertiary', 'destructive'] as const) {
      const style = controls[tier] as { minHeight: number };
      // 44pt is the platform minimum; 48 leaves room for the label to grow.
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    }
  });

  it.each([
    ['primary', controls.primary.backgroundColor, controls.primaryLabel.color, 3],
    ['destructive', controls.destructive.backgroundColor, controls.destructiveLabel.color, 4.5],
  ])('%s label is readable on its fill', (_n, bg, fg, min) => {
    expect(ratio(fg as string, bg as string)).toBeGreaterThanOrEqual(min);
  });

  it('secondary reads as an alternative, not a second primary', () => {
    expect(controls.secondary.backgroundColor).toBe('transparent');
    expect(controls.secondary.borderWidth).toBeGreaterThan(0);
    expect(ratio(controls.secondaryLabel.color, colors.surface.card)).toBeGreaterThanOrEqual(4.5);
  });

  it('destructive is not the brand colour', () => {
    expect(controls.destructive.backgroundColor).not.toBe(controls.primary.backgroundColor);
  });

  it('a disabled control keeps a legible label', () => {
    expect(
      ratio(controls.disabledLabel.color, controls.disabled.backgroundColor)
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe('tab bar colours', () => {
  // Active and inactive must differ in luminance, not only hue: the previous
  // pair sat 1.11:1 apart and the selected tab barely read.
  it('separates active from inactive by more than hue', () => {
    expect(ratio(colors.nav.active, colors.nav.inactive)).toBeGreaterThan(1.5);
  });

  it('keeps the active tint at AA on a light bar', () => {
    expect(ratio(colors.nav.active, colors.surface.card)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the inactive tint perceptible (>=3:1 for the icon)', () => {
    expect(ratio(colors.nav.inactive, colors.surface.card)).toBeGreaterThanOrEqual(3);
  });
});

describe('spacing and radius', () => {
  it('exposes an ascending spacing scale', () => {
    const values = Object.values(spacing);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it('exposes a pill radius for fully rounded controls', () => {
    expect(radius.pill).toBeGreaterThan(radius.lg);
  });

  describe('control sizing', () => {
    // The iOS HIG floor, close enough to Material's 48dp to serve both.
    it('sets a touch floor of at least 44pt', () => {
      expect(TOUCH_TARGET).toBeGreaterThanOrEqual(44);
    });

    // Fields were sized ad hoc — paddingVertical of 12, 13, 16 and 4, none of
    // them declaring a height, which left the country search around 32pt.
    it.each(Object.keys(fields))(
      'the %s field clears the touch floor',
      (name) => {
        const field = fields[name as keyof typeof fields];
        expect(field.minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET);
      }
    );

    it.each(Object.keys(fields))(
      'the %s field states a minHeight, never a fixed height',
      (name) => {
        expect(fields[name as keyof typeof fields]).not.toHaveProperty('height');
      }
    );

    it('keeps the base field at least as tall as the compact one', () => {
      expect(fields.base.minHeight).toBeGreaterThanOrEqual(
        fields.compact.minHeight
      );
    });

    it('sizes every control tier at or above the same floor', () => {
      for (const tier of ['primary', 'secondary', 'tertiary', 'destructive'] as const) {
        expect((controls[tier] as { minHeight: number }).minHeight).toBeGreaterThanOrEqual(
          TOUCH_TARGET
        );
      }
    });
  });
});