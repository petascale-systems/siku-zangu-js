'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {Pagination, Switch, WUIAdminForm, WUIDataTable, createDataTableColumns, useAdminsPage, useConfirm, useCurrentSessionAdmin, useToast} from '@siku-zangu/react';
import { Badge, Button, Drawer, DrawerHeader, DrawerItems, Spinner } from 'flowbite-react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import {Admin, AdminsFetchParams, UserStatus} from '@siku-zangu/core';

const columnHelper = createDataTableColumns<Admin>();

const fullName = (admin: Admin) =>
  `${admin?.kv?.first_name ?? ''} ${admin?.kv?.last_name ?? ''}`.trim();

export default function AdminsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const { admin: currentAdmin } = useCurrentSessionAdmin();

  const [showDrawer, setShowDrawer] = useState(false);
  const [editing, setEditing] = useState<Admin | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // The hook's pending flag is page-wide, so it cannot say which row is being
  // deleted. This keeps the spinner on the button that was clicked.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [fetchParams, setFetchParams] = useState<AdminsFetchParams>({
    page: parseInt(`${searchParams.get('page')}`) || 1,
    size: parseInt(`${searchParams.get('size')}`) || 20,
    q: searchParams.get('q') || '',
  });

  const {
    adminsPage,
    isFetchingAdminsPage,
    updateAdmin,
    createAdmin,
    deleteAdmin,
    isUpdatingAdmin,
    isCreatingAdmin,
    isDeletingAdmin,
  } = useAdminsPage(fetchParams);

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
    router.push(`/dashboard/admins?${query}`);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditing(undefined);
    setSubmitError(null);
  };

  const handleStatusToggle = async (admin: Admin, nextActive: boolean) => {
    const status: UserStatus = nextActive ? 'active' : 'inactive';
    const label = fullName(admin) || 'this admin';

    if (!nextActive) {
      const ok = await confirm({
        title: 'Deactivate admin?',
        message: `${label} will immediately lose access to the admin portal.`,
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!ok) return;
    }

    try {
      await updateAdmin(admin.user_id as string, { status } as Admin);
      toast.showToast(
        nextActive ? `${label} activated.` : `${label} deactivated.`,
        { tone: 'success' }
      );
    } catch (e: any) {
      toast.showToast(e?.message ?? 'Could not update this admin.', {
        tone: 'error',
      });
    }
  };

  const handleDelete = async (admin: Admin) => {
    const label = fullName(admin) || admin?.kv?.email || 'this admin';

    // Deleting yourself would lock you out of the portal mid-session.
    if (admin.user_id && admin.user_id === currentAdmin?.user_id) {
      toast.showToast('You cannot delete your own admin account.', {
        tone: 'warning',
      });
      return;
    }

    const ok = await confirm({
      title: 'Delete admin?',
      message: `${label} will lose access immediately. This cannot be undone.`,
      confirmLabel: 'Delete permanently',
      tone: 'danger',
      requireTypedConfirmation: 'DELETE',
    });
    if (!ok) return;

    setDeletingId(admin.user_id as string);
    try {
      await deleteAdmin(admin.user_id as string);
      toast.showToast(`${label} deleted.`, { tone: 'success' });
    } catch (e: any) {
      toast.showToast(e?.message ?? 'Could not delete this admin.', {
        tone: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (values: Admin) => {
    setSubmitError(null);
    try {
      if (editing?.user_id) {
        await updateAdmin(editing.user_id, values);
        toast.showToast('Admin updated.', { tone: 'success' });
      } else {
        await createAdmin(values);
        toast.showToast('Admin invited — they have been emailed a link.', {
          tone: 'success',
        });
      }
      closeDrawer();
    } catch (e: any) {
      // Kept in the drawer next to the fields rather than as a toast, so the
      // user can correct and resubmit without losing what they typed.
      setSubmitError(e?.message ?? 'Could not save this admin.');
    }
  };

  // See users page: a ref keeps the column defs stable while guaranteeing the
  // cells never call into a stale render's closures.
  const handlers = useRef({ handleStatusToggle, handleDelete, currentAdmin, deletingId });
  handlers.current = { handleStatusToggle, handleDelete, currentAdmin, deletingId };

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
        columnHelper.accessor((row) => row?.role ?? 'member', {
          id: 'role',
          header: 'Role',
          cell: ({ getValue }) => (
            <Badge color={getValue() === 'admin' ? 'info' : 'gray'}>
              {String(getValue())}
            </Badge>
          ),
        }),
        columnHelper.accessor((row) => row?.status ?? 'inactive', {
          id: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Switch
                checked={row.original?.status === 'active'}
                onChange={(active: boolean) =>
                  handlers.current.handleStatusToggle(row.original, active)
                }
              />
              <span className="text-xs text-gray-500">
                {row.original?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          ),
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <div className="flex gap-2">
              <Button
                size="xs"
                color="light"
                aria-label={`Edit ${fullName(row.original) || 'admin'}`}
                onClick={() => {
                  setEditing(row.original);
                  setSubmitError(null);
                  setShowDrawer(true);
                }}
              >
                <PencilSquareIcon className="size-4" />
              </Button>
              <Button
                size="xs"
                color="light"
                aria-label={`Delete ${fullName(row.original) || 'admin'}`}
                disabled={!!handlers.current.deletingId}
                onClick={() => handlers.current.handleDelete(row.original)}
              >
                {handlers.current.deletingId === row.original.user_id ? (
                  <Spinner size="sm" />
                ) : (
                  <TrashIcon className="size-4 text-red-600" />
                )}
              </Button>
            </div>
          ),
        }),
      ]),
    []
  );

  return (
    <div className="flex w-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">Admin Management</span>
        <Button
          onClick={() => {
            setEditing(undefined);
            setSubmitError(null);
            setShowDrawer(true);
          }}
        >
          Add admin
        </Button>
      </div>

      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
        <WUIDataTable
          data={adminsPage?.items ?? []}
          columns={columns}
          isLoading={isFetchingAdminsPage}
          searchPlaceholder="Search this page…"
          emptyMessage="No admins match your search."
          pageSize={fetchParams.size ?? 20}
        />

        {(adminsPage?.totalPages ?? 0) > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              page={adminsPage?.page ?? 1}
              pageSize={adminsPage?.size ?? 20}
              totalPages={adminsPage?.totalPages ?? 1}
              onChange={goToPage}
            />
          </div>
        )}
      </div>

      <Drawer open={showDrawer} onClose={closeDrawer} position="right">
        <DrawerHeader
          title={editing ? 'Edit admin' : 'Add admin'}
          titleIcon={() => <></>}
        />
        <DrawerItems>
          <WUIAdminForm
            admin={editing}
            isLoading={isCreatingAdmin || isUpdatingAdmin}
            submitError={submitError}
            onSubmit={handleSubmit}
            onCancel={closeDrawer}
          />
        </DrawerItems>
      </Drawer>
    </div>
  );
}
