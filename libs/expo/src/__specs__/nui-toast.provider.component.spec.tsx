import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { NUIToast, useToast } from '../nui-toast.provider.component';

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useToast>) => void }) {
  const api = useToast();
  onReady(api);
  return <Text>ready</Text>;
}

const setup = () => {
  let api!: ReturnType<typeof useToast>;
  render(
    <NUIToast.Provider>
      <Harness onReady={(a) => (api = a)} />
    </NUIToast.Provider>
  );
  return () => api;
};

describe('NUIToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the message it was given', () => {
    const api = setup();
    act(() => api().showSuccess('Saved'));
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  // A view that merely appears is silent to a screen reader.
  it('announces the message', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const api = setup();
    act(() => api().showError('Could not save'));
    expect(announce).toHaveBeenCalledWith('Could not save');
  });

  it('ignores an empty message', () => {
    const api = setup();
    act(() => api().showInfo(''));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  describe('queueing', () => {
    // A second toast used to clear the timer and swap the message mid-flight,
    // so the first was never actually read.
    it('keeps the first message on screen when a second arrives', () => {
      const api = setup();
      act(() => api().showSuccess('Saved'));
      act(() => api().showError('Could not save'));
      expect(screen.getByText('Saved')).toBeTruthy();
      expect(screen.queryByText('Could not save')).toBeNull();
    });

    it('shows the queued message once the first has gone', () => {
      const api = setup();
      act(() => api().showSuccess('Saved'));
      act(() => api().showError('Could not save'));
      // Just past the first toast's life plus its exit — advancing further
      // would run the queued one's own timer too.
      act(() => {
        jest.advanceTimersByTime(3400);
      });
      expect(screen.queryByText('Saved')).toBeNull();
      expect(screen.getByText('Could not save')).toBeTruthy();
    });
  });

  it('dismisses itself without being touched', () => {
    const api = setup();
    act(() => api().showSuccess('Saved'));
    act(() => {
      jest.advanceTimersByTime(3400);
    });
    expect(screen.queryByText('Saved')).toBeNull();
  });
});
