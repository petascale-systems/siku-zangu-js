import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WUIAdminForm } from '../wui-admin-form.component';
import {Admin} from '@siku-zangu/core';

const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  values: { first?: string; last?: string; email?: string }
) => {
  if (values.first !== undefined)
    await user.type(screen.getByLabelText('First name'), values.first);
  if (values.last !== undefined)
    await user.type(screen.getByLabelText('Last name'), values.last);
  if (values.email !== undefined)
    await user.type(screen.getByLabelText('Email'), values.email);
};

describe('WUIAdminForm', () => {
  it('renders every field', () => {
    render(<WUIAdminForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  // ADMIN_ZOD_SCHEMA marks every kv field optional because it also validates
  // partial PATCHes, so it would happily accept a blank admin.
  it('rejects a blank submission', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<WUIAdminForm onSubmit={onSubmit} />);
    await user.click(screen.getByText('Create admin'));
    await waitFor(() =>
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const user = userEvent.setup();
    render(<WUIAdminForm onSubmit={jest.fn()} />);
    await fill(user, { first: 'A', last: 'B', email: 'not-an-email' });
    await waitFor(() =>
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    );
  });

  it('submits a valid admin in the API shape', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<WUIAdminForm onSubmit={onSubmit} />);
    await fill(user, { first: 'Amina', last: 'Juma', email: 'amina@example.com' });
    await user.click(screen.getByText('Create admin'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      role: 'member',
      status: 'active',
      kv: {
        first_name: 'Amina',
        last_name: 'Juma',
        email: 'amina@example.com',
      },
    });
  });

  it('pre-fills from an existing admin and switches to edit wording', () => {
    const admin = {
      user_id: 'u1',
      role: 'admin',
      status: 'inactive',
      kv: { first_name: 'Zawadi', last_name: 'Mo', email: 'z@example.com' },
    } as Admin;
    render(<WUIAdminForm admin={admin} onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('First name')).toHaveValue('Zawadi');
    expect(screen.getByLabelText('Role')).toHaveValue('admin');
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });

  // The invite email is keyed to the address, so changing it would orphan them.
  it('locks the email when editing an existing admin', () => {
    const admin = { user_id: 'u1', kv: { email: 'z@example.com' } } as Admin;
    render(<WUIAdminForm admin={admin} onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('leaves the email editable when creating', () => {
    render(<WUIAdminForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('Email')).toBeEnabled();
  });

  it('surfaces a server error next to the fields', () => {
    render(<WUIAdminForm onSubmit={jest.fn()} submitError="Email already taken" />);
    expect(screen.getByText('Email already taken')).toBeInTheDocument();
  });

  it('calls onCancel when cancelled', async () => {
    const onCancel = jest.fn();
    const user = userEvent.setup();
    render(<WUIAdminForm onSubmit={jest.fn()} onCancel={onCancel} />);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
