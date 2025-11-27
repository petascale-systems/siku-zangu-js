'use client';

import { apiErrorToZodError, Email, EMAIL_ZOD_SCHEMA } from '@siku-zangu/core';
import { FormEvent, useState } from 'react';
import logoPNG from '../../../public/images/logo.png';
import { ZodError } from 'zod';
import { useUserPasswordChange, WebsiteNav } from '@siku-zangu/react';
import { Button, Label, Spinner, TextInput } from 'flowbite-react';
import Link from 'next/link';

export default function PasswordChangesPage() {
  const [_isPassword, _setIsPassword] = useState(true);
  const [_formData, _setFormData] = useState<Email>({ email: '' });
  const [_formError, _setFormError] = useState<ZodError>();
  const [_hasCreatedChange, _setHasCreatedChange] = useState<boolean>();
  const { createPasswordChange, isCreatingPasswordChange } =
    useUserPasswordChange();

  const _handleSubmitBtnClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = EMAIL_ZOD_SCHEMA.safeParse(_formData);
    _setFormError(result.error);
    if (!result.success) return;

    createPasswordChange(_formData)
      .then(() => _setHasCreatedChange(true))
      .catch((e) => _setFormError(apiErrorToZodError(e)));
  };

  return (
    <div className="h-full overflow-y-auto">
      <WebsiteNav logo={logoPNG} />
      <div className="flex flex-col justify-center items-center gap-6 h-[calc(100%-4rem)] mt-16">
        {_hasCreatedChange && (
          <form
            className="p-8 flex flex-col items-center border border-gray-200 rounded-lg gap-6 shadow"
            onSubmit={_handleSubmitBtnClick}
          >
            <span className="text-2xl font-semibold text-gray-600">
              Check Your Email
            </span>
            <span className="text-gray-500 text-base text-center w-2/3 text-wrap">
              We sent a password reset link to{' '}
              <span className="font-medium">{_formData.email}</span>. It may
              take a few minutes.
            </span>
            <Button color="primary" className="gap-2 w-full" type="submit">
              {isCreatingPasswordChange && <Spinner color="gray" size="md" />}
              <span>
                {isCreatingPasswordChange && 'Resending reset link ...'}
              </span>
              <span>{!isCreatingPasswordChange && 'Resend reset link'}</span>
            </Button>
          </form>
        )}
        {!_hasCreatedChange && (
          <div className="p-8 flex flex-col items-center border border-gray-200 rounded-lg gap-6 shadow">
            <span className="text-lg font-medium text-gray-600">
              Reset password
            </span>
            <span className="text-gray-500 text-base text-center w-2/3 text-wrap">
              Enter the email associated with your admin account
            </span>
            <form
              className="w-96 space-y-4 flex flex-col"
              onSubmit={_handleSubmitBtnClick}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="password_change_email">E-mail</Label>
                <TextInput
                  id="password_change_email"
                  placeholder="admin@company.com"
                  onChange={(e) => _setFormData({ email: e.target.value })}
                />
                <span className="text-xs text-red-400">
                  {
                    _formError?.issues?.find(
                      (issue) => issue.path && issue.path[0] == 'email'
                    )?.message
                  }
                </span>
              </div>

              <Button color="primary" className="gap-2" type="submit">
                {isCreatingPasswordChange && <Spinner color="gray" size="md" />}
                <span>
                  {isCreatingPasswordChange && 'Sending reset link ...'}
                </span>
                <span>{!isCreatingPasswordChange && 'Send reset link'}</span>
              </Button>
              <div className="flex justify-end">
                <Link
                  color="primary"
                  href="/login"
                  className="text-primary underline text-sm"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
