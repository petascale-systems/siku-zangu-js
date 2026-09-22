import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConfirmOptions,
  WUIConfirmDialog,
  useConfirm,
} from '../wui-confirm-dialog.provider.component';

const Harness = ({ options }: { options: ConfirmOptions }) => {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>('pending');
  return (
    <>
      <button onClick={async () => setResult(String(await confirm(options)))}>
        ask
      </button>
      <span data-testid="result">{result}</span>
    </>
  );
};

const BASIC: ConfirmOptions = {
  title: 'Delete user?',
  message: 'This cannot be undone.',
};

const setup = (options: ConfirmOptions = BASIC) => {
  const user = userEvent.setup();
  render(
    <WUIConfirmDialog.Provider>
      <Harness options={options} />
    </WUIConfirmDialog.Provider>
  );
  return user;
};

describe('WUIConfirmDialogProvider', () => {
  it('shows no dialog until asked', () => {
    setup();
    expect(screen.queryByText('Delete user?')).not.toBeInTheDocument();
  });

  it('shows the title and message', async () => {
    const user = await setup();
    await user.click(screen.getByText('ask'));
    expect(await screen.findByText('Delete user?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('resolves true when confirmed', async () => {
    const user = await setup();
    await user.click(screen.getByText('ask'));
    await user.click(await screen.findByText('Confirm'));
    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent('true')
    );
  });

  it('resolves false when cancelled', async () => {
    const user = await setup();
    await user.click(screen.getByText('ask'));
    await user.click(await screen.findByText('Cancel'));
    await waitFor(() =>
      expect(screen.getByTestId('result')).toHaveTextContent('false')
    );
  });

  it('uses custom button labels', async () => {
    const user = await setup({ ...BASIC, confirmLabel: 'Delete permanently' });
    await user.click(screen.getByText('ask'));
    expect(await screen.findByText('Delete permanently')).toBeInTheDocument();
  });

  // Irreversible actions must not be one mis-click away.
  describe('typed confirmation', () => {
    const TYPED: ConfirmOptions = { ...BASIC, requireTypedConfirmation: 'DELETE' };

    it('disables confirm until the phrase matches', async () => {
      const user = await setup(TYPED);
      await user.click(screen.getByText('ask'));
      const confirmBtn = await screen.findByText('Confirm');
      expect(confirmBtn).toBeDisabled();

      await user.type(screen.getByLabelText(/Type/), 'DELET');
      expect(confirmBtn).toBeDisabled();

      await user.type(screen.getByLabelText(/Type/), 'E');
      await waitFor(() => expect(confirmBtn).toBeEnabled());
    });

    it('is case sensitive', async () => {
      const user = await setup(TYPED);
      await user.click(screen.getByText('ask'));
      await user.type(screen.getByLabelText(/Type/), 'delete');
      expect(await screen.findByText('Confirm')).toBeDisabled();
    });
  });
});
