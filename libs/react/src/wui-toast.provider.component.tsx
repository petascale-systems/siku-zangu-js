'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Toast, ToastToggle } from 'flowbite-react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. Errors stay until dismissed. */
  durationMs?: number;
};

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number | null;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => -1,
  dismissToast: () => undefined,
});

const DEFAULT_DURATION_MS = 4000;

const TONE_STYLES: Record<ToastTone, { icon: React.ReactNode; ring: string }> = {
  success: {
    icon: <CheckCircleIcon className="size-5" />,
    ring: 'bg-green-100 text-green-600',
  },
  error: {
    icon: <XCircleIcon className="size-5" />,
    ring: 'bg-red-100 text-red-600',
  },
  warning: {
    icon: <ExclamationTriangleIcon className="size-5" />,
    ring: 'bg-amber-100 text-amber-700',
  },
  info: {
    icon: <InformationCircleIcon className="size-5" />,
    ring: 'bg-blue-100 text-blue-600',
  },
};

/**
 * App-wide toasts.
 *
 * Before this, actions gave no feedback at all — a save either silently worked
 * or silently didn't. Errors deliberately do not auto-dismiss: a failure the
 * user misses is worse than one they have to click away.
 */
function Provider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const tone = options?.tone ?? 'info';
      const durationMs =
        options?.durationMs ??
        (tone === 'error' ? null : DEFAULT_DURATION_MS);

      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, tone, durationMs }]);

      if (durationMs !== null) {
        timers.current.set(
          id,
          setTimeout(() => dismissToast(id), durationMs)
        );
      }
      return id;
    },
    [dismissToast]
  );

  // Clear any pending timers if the provider goes away mid-countdown.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        // Announced to screen readers; `polite` so it waits for a pause rather
        // than interrupting whatever the user is doing.
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} className="min-w-72">
            <div
              className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${
                TONE_STYLES[toast.tone].ring
              }`}
            >
              {TONE_STYLES[toast.tone].icon}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <ToastToggle onDismiss={() => dismissToast(toast.id)} />
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => useContext(ToastContext);

export const WUIToast = { Provider };
