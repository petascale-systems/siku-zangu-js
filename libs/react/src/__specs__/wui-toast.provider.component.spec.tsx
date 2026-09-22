import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WUIToast, useToast } from '../wui-toast.provider.component';

const Trigger = ({ tone }: { tone?: 'success' | 'error' }) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(`a ${tone ?? 'info'} message`, { tone })}>
      fire
    </button>
  );
};

const setup = (tone?: 'success' | 'error') =>
  render(
    <WUIToast.Provider>
      <Trigger tone={tone} />
    </WUIToast.Provider>
  );

describe('WUIToastProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const click = async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.click(screen.getByText('fire'));
  };

  it('shows nothing until a toast is raised', () => {
    setup();
    expect(screen.queryByText(/message/)).not.toBeInTheDocument();
  });

  it('renders a raised toast', async () => {
    setup('success');
    await click();
    expect(screen.getByText('a success message')).toBeInTheDocument();
  });

  it('announces toasts politely to assistive tech', async () => {
    setup('success');
    await click();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-dismisses a success toast', async () => {
    setup('success');
    await click();
    expect(screen.getByText('a success message')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('a success message')).not.toBeInTheDocument();
  });

  // A failure the user misses is worse than one they must dismiss.
  it('keeps an error toast until it is dismissed', async () => {
    setup('error');
    await click();
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('a error message')).toBeInTheDocument();
  });

  it('stacks multiple toasts', async () => {
    setup('success');
    await click();
    await click();
    expect(screen.getAllByText('a success message')).toHaveLength(2);
  });
});
