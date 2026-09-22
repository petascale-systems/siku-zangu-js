import { Alert } from 'react-native';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Renders the confirm button in the platform's destructive style. */
  destructive?: boolean;
};

/**
 * A confirmation, as a promise.
 *
 * `Alert.alert` already *is* the native alert — `UIAlertController` on iOS, an
 * `AlertDialog` on Android — so there is nothing to replace, only something to
 * tidy. Each call site built its own two-button array inline, which is why the
 * copy drifted and why dismissing by tapping outside was handled in one place
 * and forgotten in another.
 *
 * Mirrors `useConfirm` on the web (`wui-confirm-dialog.provider.component.tsx`)
 * so both platforms read the same way:
 *
 *     if (!(await confirmAsync({ … }))) return;
 *
 * Anything other than pressing confirm resolves `false` — cancel, the Android
 * back button, and a tap outside the dialog. A confirmation that resolved
 * `true` by accident would delete an account.
 */
export function confirmAsync({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // Guards against a platform calling both a button handler and onDismiss.
    let settled = false;
    const settle = (result: boolean) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => settle(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => settle(true),
        },
      ],
      { cancelable: true, onDismiss: () => settle(false) }
    );
  });
}
