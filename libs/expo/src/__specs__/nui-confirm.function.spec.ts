import { Alert, AlertButton, AlertOptions } from 'react-native';
import { confirmAsync } from '../nui-confirm.function';

type Captured = {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
};

const captured: Captured = {};

jest.spyOn(Alert, 'alert').mockImplementation(((
  title?: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => {
  captured.title = title;
  captured.message = message;
  captured.buttons = buttons;
  captured.options = options;
}) as typeof Alert.alert);

const OPTIONS = {
  title: 'Delete account?',
  message: 'This cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
};

const button = (label: string) =>
  captured.buttons?.find((b) => b.text === label);

describe('confirmAsync', () => {
  it('resolves true when the confirm button is pressed', async () => {
    const result = confirmAsync(OPTIONS);
    button('Delete')?.onPress?.();
    await expect(result).resolves.toBe(true);
  });

  it('resolves false when cancelled', async () => {
    const result = confirmAsync(OPTIONS);
    button('Cancel')?.onPress?.();
    await expect(result).resolves.toBe(false);
  });

  // Tapping outside, or the Android back button, is not consent.
  it('resolves false when dismissed without choosing', async () => {
    const result = confirmAsync(OPTIONS);
    captured.options?.onDismiss?.();
    await expect(result).resolves.toBe(false);
  });

  it('marks the cancel button so the platform can order it correctly', () => {
    confirmAsync(OPTIONS);
    expect(button('Cancel')?.style).toBe('cancel');
  });

  it('asks for the destructive style only when told to', () => {
    confirmAsync({ ...OPTIONS, destructive: true });
    expect(button('Delete')?.style).toBe('destructive');
    confirmAsync(OPTIONS);
    expect(button('Delete')?.style).toBe('default');
  });

  // A platform that fires both a button handler and onDismiss must not be able
  // to turn a cancel into a confirm.
  it('settles once, on the first outcome', async () => {
    const result = confirmAsync(OPTIONS);
    button('Cancel')?.onPress?.();
    captured.options?.onDismiss?.();
    button('Delete')?.onPress?.();
    await expect(result).resolves.toBe(false);
  });
});
