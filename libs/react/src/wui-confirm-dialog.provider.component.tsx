'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions get a red button and a warning icon. */
  tone?: 'danger' | 'default';
  /**
   * When set, the user must type this exact text to enable confirmation.
   * Reserve it for irreversible, high-blast-radius actions.
   */
  requireTypedConfirmation?: string;
};

type ConfirmContextValue = {
  /** Resolves true if the user confirmed, false otherwise. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: async () => false,
});

/**
 * Promise-based confirmations, so a call site reads as a straight line:
 *
 *   if (!(await confirm({ ... }))) return;
 *
 * Destructive dashboard actions previously fired on a single click with no
 * confirmation at all.
 */
function Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState('');
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
    setTyped('');
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => {
    // A second request while one is open cancels the first rather than
    // orphaning its promise.
    resolver.current?.(false);
    setTyped('');
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const isDanger = options?.tone === 'danger';
  const required = options?.requireTypedConfirmation;
  const canConfirm = !required || typed === required;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        show={!!options}
        size="md"
        popup
        // Dismissing any other way is a cancel, never a confirm.
        onClose={() => settle(false)}
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            {isDanger && (
              <ExclamationTriangleIcon className="mx-auto mb-4 size-12 text-red-600" />
            )}
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {options?.title}
            </h3>
            <p className="mb-5 text-sm text-gray-500">{options?.message}</p>

            {required && (
              <div className="mb-5 text-left">
                <label
                  htmlFor="confirm-phrase"
                  className="mb-1 block text-sm text-gray-700"
                >
                  Type <span className="font-semibold">{required}</span> to
                  confirm
                </label>
                <input
                  id="confirm-phrase"
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="w-full rounded-lg border border-gray-400 p-2.5 text-sm text-gray-900"
                />
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button
                color={isDanger ? 'red' : 'primary'}
                disabled={!canConfirm}
                onClick={() => settle(true)}
              >
                {options?.confirmLabel ?? 'Confirm'}
              </Button>
              <Button color="alternative" onClick={() => settle(false)}>
                {options?.cancelLabel ?? 'Cancel'}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = (): ConfirmContextValue['confirm'] =>
  useContext(ConfirmContext).confirm;

export const WUIConfirmDialog = { Provider };
