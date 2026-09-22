'use client';

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button, Label, Select, Spinner, TextInput } from 'flowbite-react';
import {Admin, AdminRole, UserStatus} from '@siku-zangu/core';

/**
 * Form-level schema.
 *
 * `ADMIN_ZOD_SCHEMA` in libs/core marks every `kv` field optional, because it
 * also validates partial PATCHes. That makes it useless as a form guard — it
 * accepts an admin with no name and no email. This is the stricter shape the
 * form actually requires.
 */
const ADMIN_FORM_SCHEMA = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(64, 'First name is too long'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(64, 'Last name is too long'),
  email: z.email('Enter a valid email address'),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'inactive']),
});

export type AdminFormValues = z.infer<typeof ADMIN_FORM_SCHEMA>;

export type WUIAdminFormProps = {
  admin?: Admin;
  isLoading?: boolean;
  /** Server-side message, shown above the actions. */
  submitError?: string | null;
  onSubmit: (admin: Admin) => void | Promise<void>;
  onCancel?: () => void;
};

/** Field-level error text, or null while the field is untouched. */
function FieldError({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null;
  const first = errors[0] as { message?: string } | string | undefined;
  const message = typeof first === 'string' ? first : first?.message;
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

export function WUIAdminForm({
  admin,
  isLoading = false,
  submitError = null,
  onSubmit,
  onCancel,
}: WUIAdminFormProps) {
  const isEditing = !!admin?.user_id;

  const form = useForm({
    defaultValues: {
      first_name: admin?.kv?.first_name ?? '',
      last_name: admin?.kv?.last_name ?? '',
      email: admin?.kv?.email ?? '',
      role: (admin?.role ?? 'member') as AdminRole,
      status: (admin?.status ?? 'active') as UserStatus,
    } as AdminFormValues,
    validators: {
      // Validate as the user types once a field has been touched, so mistakes
      // surface before submit rather than after a failed round trip.
      onChange: ADMIN_FORM_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        role: value.role,
        status: value.status,
        kv: {
          first_name: value.first_name,
          last_name: value.last_name,
          email: value.email,
        },
      } as Admin);
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <form.Field name="first_name">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>First name</Label>
            <TextInput
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              color={field.state.meta.errors.length ? 'failure' : undefined}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="last_name">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Last name</Label>
            <TextInput
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              color={field.state.meta.errors.length ? 'failure' : undefined}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Email</Label>
            <TextInput
              id={field.name}
              name={field.name}
              type="email"
              // The invite email is keyed to this address, so changing it on an
              // existing admin would silently orphan their account.
              disabled={isEditing}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              color={field.state.meta.errors.length ? 'failure' : undefined}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="role">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Role</Label>
            <Select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value as AdminRole)
              }
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <div>
            <Label htmlFor={field.name}>Status</Label>
            <Select
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value as UserStatus)
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <div className="flex gap-2">
            <Button type="submit" disabled={!canSubmit || isLoading}>
              {isSubmitting || isLoading ? (
                <Spinner size="sm" />
              ) : isEditing ? (
                'Save changes'
              ) : (
                'Create admin'
              )}
            </Button>
            {onCancel && (
              <Button type="button" color="alternative" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
