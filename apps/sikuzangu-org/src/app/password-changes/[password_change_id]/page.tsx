'use client';

import {
  apiErrorToZodError,
  Password,
  PASSWORD_ZOD_SCHEMA,
} from '@siku-zangu/core';
import { Field, Input, Label } from '@headlessui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FormEvent, useState } from 'react';
import logoPNG from '../../../../public/images/logo.png';
import { ZodError } from 'zod';
import { useUserPasswordChange, WebsiteNav } from '@siku-zangu/react';
import { useParams } from 'next/navigation';

export default function PasswordChangeByLinkPage() {
  const { password_change_id: passwordChangeId } = useParams<{
    password_change_id: string;
  }>();
  const [_isPassword, _setIsPassword] = useState(true);
  const [_formData, _setFormData] = useState<Password>({
    password: '',
    confirm_password: '',
  });
  const [_formError, _setFormError] = useState<ZodError>();
  const { changePassword, isFetchingPasswordChange, isChangingPassword } =
    useUserPasswordChange(passwordChangeId);

  const _handleSubmitBtnClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = PASSWORD_ZOD_SCHEMA.safeParse(_formData);
    _setFormError(result.error);
    if (!result.success) return;

    changePassword(_formData).catch((e) =>
      _setFormError(apiErrorToZodError(e))
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <WebsiteNav logo={logoPNG} />
      <div className="flex flex-col justify-center items-center gap-6 h-[calc(100%-4rem)] mt-16">
        <div className="p-8 flex flex-col items-center border border-gray-200 rounded-lg gap-6 shadow">
          <span className="text-lg font-medium text-gray-600">
            Set a new password
          </span>
          <div className="w-full font-light">
            <span className="text-gray-500 text-base">
              Your new password must:
            </span>
            <ul className="list-disc text-gray-500">
              <li>be at least 8 characters long</li>
              <li>have at least one uppercase character</li>
              <li>have at least one digit</li>
              <li>have at least one symbol</li>
            </ul>
          </div>
          <form className="w-96 space-y-4" onSubmit={_handleSubmitBtnClick}>
            <Field className="flex flex-col gap-2">
              <Label className="text-base font-medium text-tertiary">
                Password
              </Label>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 border border-gray-300 px-4 py-2 rounded-lg focus-within:outline-gray-300 focus-within:outline-offset-1 focus-within:outline-2">
                  <Input
                    type={_isPassword ? 'password' : 'text'}
                    name="password"
                    onChange={(e) =>
                      _setFormData({ ..._formData, password: e.target.value })
                    }
                    className="appearance-none focus:outline-none grow text-gray-500 placeholder:text-gray-300"
                  />
                  <button
                    onClick={() => _setIsPassword(!_isPassword)}
                    type="button"
                  >
                    <EyeSlashIcon
                      className={`text-gray-500 size-4.5 ${
                        _isPassword ? 'hidden' : ''
                      }`}
                    />
                    <EyeIcon
                      className={`text-gray-500 size-4.5 ${
                        !_isPassword ? 'hidden' : ''
                      }`}
                    />
                  </button>
                </div>
                <span className="text-xs text-red-400">
                  {
                    _formError?.issues?.find(
                      (issue) => issue.path && issue.path[0] == 'password'
                    )?.message
                  }
                </span>
              </div>
            </Field>

            <Field className="flex flex-col gap-2">
              <Label className="text-base font-medium text-tertiary">
                Confirm password
              </Label>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 border border-gray-300 px-4 py-2 rounded-lg focus-within:outline-gray-300 focus-within:outline-offset-1 focus-within:outline-2">
                  <Input
                    type={_isPassword ? 'password' : 'text'}
                    name="password"
                    onChange={(e) =>
                      _setFormData({
                        ..._formData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="appearance-none focus:outline-none grow text-gray-500 placeholder:text-gray-300"
                  />
                  <button
                    onClick={() => _setIsPassword(!_isPassword)}
                    type="button"
                  >
                    <EyeSlashIcon
                      className={`text-gray-500 size-4.5 ${
                        _isPassword ? 'hidden' : ''
                      }`}
                    />
                    <EyeIcon
                      className={`text-gray-500 size-4.5 ${
                        !_isPassword ? 'hidden' : ''
                      }`}
                    />
                  </button>
                </div>
                <span className="text-xs text-red-400">
                  {
                    _formError?.issues?.find(
                      (issue) =>
                        issue.path && issue.path[0] == 'confirm_password'
                    )?.message
                  }
                </span>
              </div>
            </Field>

            <button
              disabled={isFetchingPasswordChange || isChangingPassword}
              type="submit"
              className="bg-primary text-white rounded-full w-full text-center py-2.5 text-sm font-medium"
            >
              {'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
