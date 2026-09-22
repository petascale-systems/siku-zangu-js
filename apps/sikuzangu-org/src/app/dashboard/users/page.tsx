'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {Pagination, Switch, WUIDataTable, createDataTableColumns, useConfirm, useToast, useUsersPage} from '@siku-zangu/react';
import { Button, Spinner } from 'flowbite-react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import {User, UsersFetchParams, UserStatus} from '@siku-zangu/core';

const columnHelper = createDataTableColumns<User>();

const fullName = (user: User) =>
  `${user?.kv?.first_name ?? ''} ${user?.kv?.last_name ?? ''}`.trim();

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();

  const [fetchParams, setFetchParams] = useState<UsersFetchParams>({
    page: parseInt(`${searchParams.get('page')}`) || 1,
    size: parseInt(`${searchParams.get('size')}`) || 20,
    q: searchParams.get('q') || '',
  });

  const {
    usersPage,
    isFetchingUsersPage,
    updateUser,
    deleteUser,
  } = useUsersPage(fetchParams);

  // The hook's pending flag is page-wide, so it cannot say which row is being
  // deleted. This does, which keeps the spinner on the button that was clicked.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setFetchParams({
      page: parseInt(`${searchParams.get('page')}`) || 1,
      size: parseInt(`${searchParams.get('size')}`) || 20,
      q: searchParams.get('q') || '',
    });
  }, [searchParams]);

  const goToPage = (page: number) => {
    const next = { ...fetchParams, page };
    const query = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    router.push(`/dashboard/users?${query}`);
  };

  const handleStatusToggle = async (user: User, nextActive: boolean) => {
    const status: UserStatus = nextActive ? 'active' : 'inactive';
    const label = fullName(user) || 'this user';

    // Deactivating cuts off access, so make it deliberate. Re-activating is
    // harmless and stays a single click.
    if (!nextActive) {
      const ok = await confirm({
        title: 'Deactivate user?',
        message: `${label} will no longer be able to sign in. You can re-activate them at any time.`,
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!ok) return;
    }

    try {
      await updateUser(user.user_id as string, { kv: { status } } as User);
      toast.showToast(
        nextActive ? `${label} activated.` : `${label} deactivated.`,
        { tone: 'success' }
      );
    } catch (e: any) {
      // Previously this went to console.error and the toggle silently snapped
      // back with no explanation.
      toast.showToast(e?.message ?? 'Could not update this user.', {
        tone: 'error',
      });
    }
  };

  const handleDelete = async (user: User) => {
    const label = fullName(user) || user?.kv?.email || 'this user';
    const ok = await confirm({
      title: 'Delete user?',
      message: `This permanently deletes ${label} and all of their cycle data. This cannot be undone.`,
      confirmLabel: 'Delete permanently',
      tone: 'danger',
      requireTypedConfirmation: 'DELETE',
    });
    if (!ok) return;

    // Marks the row so its own button shows the spinner, while every other
    // delete is blocked until this one settles.
    setDeletingId(user.user_id as string);
    try {
      await deleteUser(user.user_id as string);
      toast.showToast(`${label} deleted.`, { tone: 'success' });
    } catch (e: any) {
      toast.showToast(e?.message ?? 'Could not delete this user.', {
        tone: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Cells reach handlers through a ref, so the column defs can stay referentially
  // stable (TanStack v9 reprocesses when `columns` changes identity) without the
  // cells ever closing over a stale render's state.
  const handlers = useRef({ handleStatusToggle, handleDelete, deletingId });
  handlers.current = { handleStatusToggle, handleDelete, deletingId };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((row) => fullName(row) || '—', {
          id: 'name',
          header: 'Name',
        }),
        columnHelper.accessor((row) => row?.kv?.email ?? '—', {
          id: 'email',
          header: 'Email',
        }),
        columnHelper.accessor((row) => row?.created_at ?? '', {
          id: 'created_at',
          header: 'Registered',
          cell: ({ getValue }) => {
            const value = getValue() as string;
            return value ? new Date(value).toLocaleDateString() : '—';
          },
        }),
        columnHelper.accessor((row) => row?.kv?.status ?? 'inactive', {
          id: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Switch
                checked={row.original?.kv?.status === 'active'}
                onChange={(active: boolean) =>
                  handlers.current.handleStatusToggle(row.original, active)
                }
              />
              <span className="text-xs text-gray-500">
                {row.original?.kv?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          ),
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <Button
              size="xs"
              color="light"
              aria-label={`Delete ${fullName(row.original) || 'user'}`}
              disabled={!!handlers.current.deletingId}
              onClick={() => handlers.current.handleDelete(row.original)}
            >
              {handlers.current.deletingId === row.original.user_id ? (
                <Spinner size="sm" />
              ) : (
                <TrashIcon className="size-4 text-red-600" />
              )}
            </Button>
          ),
        }),
      ]),
    []
  );

  return (
    <div className="flex w-full flex-col gap-6 p-5">
      <span className="text-xl font-bold">User Management</span>

      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
        <WUIDataTable
          data={usersPage?.items ?? []}
          columns={columns}
          isLoading={isFetchingUsersPage}
          searchPlaceholder="Search this page…"
          emptyMessage="No users match your search."
          pageSize={fetchParams.size ?? 20}
        />

        {(usersPage?.totalPages ?? 0) > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              page={usersPage?.page ?? 1}
              pageSize={usersPage?.size ?? 20}
              totalPages={usersPage?.totalPages ?? 1}
              onChange={goToPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
