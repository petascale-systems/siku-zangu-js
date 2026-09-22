import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from './theme';
import { MAX_FONT_SCALE, typography } from './typography';

export type ToastVariant = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; variant: ToastVariant };

type ToastApi = {
  showToast: (message: string, variant?: ToastVariant) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** How long a toast stays up before dismissing itself. */
const VISIBLE_MS = 3200;

/** Exit animation duration, and how long the queue waits before advancing. */
const EXIT_MS = 180;

const VARIANTS: Record<
  ToastVariant,
  { fill: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: { fill: colors.state.success, icon: 'checkmark-circle' },
  error: { fill: colors.state.error, icon: 'alert-circle' },
  info: { fill: colors.state.info, icon: 'information-circle' },
};

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  // Queued rather than replaced: a second toast used to clear the timer and
  // swap the message mid-flight, so a "Saved" could be swallowed by whatever
  // fired next.
  const queue = useRef<Toast[]>([]);
  const reduceMotion = useRef(false);
  // Mirrors `toast` so showToast can tell whether something is on screen
  // without taking a dependency on the state and re-creating itself.
  const toastRef = useRef<Toast | null>(null);
  toastRef.current = toast;
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(-16)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextId = useRef(0);
  // Reads the context directly: useSafeAreaInsets() throws when the context is
  // null, and a toast is never worth taking a screen down over.
  const insets = useContext(SafeAreaInsetsContext);

  // Honour the OS accessibility setting rather than animating regardless.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) reduceMotion.current = enabled;
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        reduceMotion.current = enabled;
      }
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  /** Brings a toast on screen and schedules its dismissal. */
  const show = useCallback(
    (next: Toast) => {
      // VoiceOver/TalkBack do not announce a view that simply appears.
      AccessibilityInfo.announceForAccessibility?.(next.message);
      if (timer.current) clearTimeout(timer.current);

      if (reduceMotion.current) {
        opacity.setValue(1);
        offset.setValue(0);
      } else {
        opacity.setValue(0);
        offset.setValue(-16);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(offset, {
            toValue: 0,
            damping: 18,
            stiffness: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }
      timer.current = setTimeout(() => dismissRef.current(), VISIBLE_MS);
    },
    [opacity, offset]
  );

  const dismiss = useCallback(() => {
    const settle = () => {
      // Whatever arrived while this one was showing goes next, rather than
      // having replaced it mid-flight.
      const next = queue.current.shift() ?? null;
      toastRef.current = next;
      setToast(next);
      if (next) show(next);
    };

    if (timer.current) clearTimeout(timer.current);
    if (reduceMotion.current) {
      settle();
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: -16,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
    ]).start();
    // Advancing on a timer rather than on the animation's completion callback:
    // an animation that is interrupted never calls back, which would strand
    // everything still queued behind this toast.
    timer.current = setTimeout(settle, EXIT_MS);
  }, [opacity, offset, show]);

  // The timer is scheduled inside `show`, which cannot close over `dismiss`
  // without the two becoming mutually recursive dependencies.
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      if (!message) return;
      nextId.current += 1;
      const next = { id: nextId.current, message, variant };
      // Something is already showing: queue behind it.
      if (toastRef.current) {
        queue.current.push(next);
        return;
      }
      toastRef.current = next;
      setToast(next);
      show(next);
    },
    [show]
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      showToast,
      showSuccess: (message: string) => showToast(message, 'success'),
      showError: (message: string) => showToast(message, 'error'),
      showInfo: (message: string) => showToast(message, 'info'),
    }),
    [showToast]
  );

  const variant = toast ? VARIANTS[toast.variant] : VARIANTS.info;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.wrapper,
            {
              top: (insets?.top ?? 0) + spacing.sm,
              opacity,
              transform: [{ translateY: offset }],
            },
          ]}
          pointerEvents="box-none"
          accessibilityLiveRegion="polite"
        >
          <Pressable
            style={[styles.toast, { backgroundColor: variant.fill }]}
            onPress={dismiss}
            accessibilityRole="alert"
            accessibilityLabel={toast.message}
          >
            <Ionicons name={variant.icon} size={20} color={colors.text.inverse} />
            <Text
              style={styles.message}
              numberOfLines={3}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Transient success/error feedback.
 *
 * Replaces `Alert.alert` for reporting an outcome. A modal alert stops the
 * person, dims the app and demands a tap to acknowledge something they did not
 * ask about — for "Saved" that is a lot of ceremony. Confirmations, where
 * there is a real choice to make, stay as alerts.
 *
 * Mounted above the navigator so a toast survives the screen that raised it:
 * several of these fire immediately before a `router.back()`.
 */
export const NUIToast = { Provider: ToastProvider };

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <NUIToast.Provider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    // Above the navigator, including a native header.
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  message: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.inverse,
    flexShrink: 1,
  },
});
