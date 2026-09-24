import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, ScrollView } from 'react-native';

type Options = {
  horizontal?: boolean;
  /** Changing this re-centres the selection, e.g. each time a tab is focused. */
  resetKey?: unknown;
};

/**
 * Keeps a scrolling picker's selected option in view.
 *
 * A picker list starts at the top, so a stored or default value further down
 * — a birth year, a 28-day cycle, today's date — opened out of sight and the
 * list looked unset. This centres the selection whenever it changes from
 * outside (a default, a value loaded from the server, switching between the
 * day/month/year lists) and on `resetKey`.
 *
 * Positions are measured with `onLayout` rather than computed, because rows
 * grow with the OS font scale. The options must be direct children of the
 * ScrollView so their layout is relative to its content.
 *
 * A value the user just tapped is already under their finger, so it is not
 * re-centred — call `markTapped` from `onPress` before selecting.
 *
 *     const picker = useScrollToSelected(selectedYear);
 *     <ScrollView ref={picker.scrollRef} onLayout={picker.onScrollLayout}>
 *       {years.map((y) => (
 *         <TouchableOpacity key={y} onLayout={picker.onItemLayout(y)}
 *           onPress={() => { picker.markTapped(y); setSelectedYear(y); }} />
 *       ))}
 *     </ScrollView>
 */
export function useScrollToSelected<K extends string | number>(
  selected: K | null | undefined,
  { horizontal = false, resetKey }: Options = {}
) {
  const scrollRef = useRef<ScrollView>(null);
  const viewportRef = useRef(0);
  const itemsRef = useRef(new Map<K, { offset: number; size: number }>());
  const tappedRef = useRef(false);
  // Bumped when the measurements the centring needs arrive, which can be
  // before or after the selection itself is known.
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    if (tappedRef.current) {
      tappedRef.current = false;
      return;
    }
    if (selected == null) return;
    const item = itemsRef.current.get(selected);
    const viewport = viewportRef.current;
    if (!item || !viewport) return;
    const offset = Math.max(0, item.offset - (viewport - item.size) / 2);
    scrollRef.current?.scrollTo(
      horizontal ? { x: offset, animated: false } : { y: offset, animated: false }
    );
  }, [selected, layoutVersion, resetKey, horizontal]);

  const onScrollLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      viewportRef.current = horizontal ? width : height;
      setLayoutVersion((v) => v + 1);
    },
    [horizontal]
  );

  const onItemLayout = useCallback(
    (key: K) => (e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      itemsRef.current.set(
        key,
        horizontal ? { offset: x, size: width } : { offset: y, size: height }
      );
      if (key === selected) setLayoutVersion((v) => v + 1);
    },
    [horizontal, selected]
  );

  const markTapped = useCallback(
    (key: K) => {
      // Only a change re-runs the effect that clears the flag.
      if (key !== selected) tappedRef.current = true;
    },
    [selected]
  );

  return { scrollRef, onScrollLayout, onItemLayout, markTapped };
}
