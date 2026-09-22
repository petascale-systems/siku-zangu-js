'use client';

import React, { Suspense } from 'react';
import {NavLink, useCurrentSessionAdmin, WUIConfirmDialog, WUIToast} from '@siku-zangu/react';
import {
  ArrowRightStartOnRectangleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HomeIcon,
  ShieldExclamationIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Avatar, Button } from 'flowbite-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useCurrentSessionAdmin();

  return (
    // Toasts and confirmations are dashboard-wide so any page can reach them.
    <WUIToast.Provider>
    <WUIConfirmDialog.Provider>
    <div className="bg-inherit h-full flex divide-x divide-gray-200">
      <nav className="min-w-64 h-full flex flex-col divide-y divide-gray-200">
        <div className="h-15 w-full px-4 flex justify-start items-center">
          <span className="text-primary font-bold text-lg">
            Sikuzangu Admin
          </span>
        </div>

        <div className="grow w-full py-4 px-2">
          <NavLink
            href="/dashboard"
            text="Dashboard"
            activeMode="exact"
            icon={<HomeIcon className="size-4.5 stroke-2" />}
          />
          <NavLink
            href="/dashboard/admins"
            text="Admins"
            icon={<ShieldExclamationIcon className="size-5 stroke-2" />}
          />
          <NavLink
            href="/dashboard/users"
            text="Users"
            icon={<UsersIcon className="size-4.5 stroke-2" />}
          />
          <NavLink
            href="/dashboard/articles"
            text="Articles"
            icon={<DocumentTextIcon className="size-4.5 stroke-2" />}
          />
          <NavLink
            href="/dashboard/trends"
            text="Trends"
            icon={<ArrowTrendingUpIcon className="size-4.5 stroke-2" />}
          />
        </div>
      </nav>
      <main className="h-full grow flex flex-col divide-y divide-gray-200">
        <div className="flex justify-between items-center min-h-15 sticky px-4">
          <span className="text-primary text-base font-medium">
            Sikuzangu Admin Portal
          </span>
          <div className="flex justify-end items-center gap-2">
            <Avatar rounded size="xs">
              <span className="text-gray-600 text-xs">
                {admin?.kv?.first_name} {admin?.kv?.last_name}
              </span>
            </Avatar>
            <Button onClick={logout} size="sm" color="info">
              <ArrowRightStartOnRectangleIcon className="size-4.5" />
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 grow overflow-y-auto">
          <Suspense fallback={<span>Loading...</span>}>{children}</Suspense>
        </div>
      </main>
    </div>
    </WUIConfirmDialog.Provider>
    </WUIToast.Provider>
  );
}
