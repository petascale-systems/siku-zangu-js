import { NextRequest } from 'next/server';
import { Admin, handleAPIError } from '@siku-zangu/core';
import {
  deleteOneAdminByUserId,
  selectOneAdminByUserId,
  updateOneAdmin,
} from '@siku-zangu/knex';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ admin_id: string }> }
) {
  return handleAPIError(async () => {
    const { admin_id } = await params;
    const admin = await selectOneAdminByUserId(admin_id);
    return Response.json(admin);
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ admin_id: string }> }
) {
  return handleAPIError(async () => {
    const { admin_id } = await params;
    const body = (await req.json()) as Admin;
    const admin = await updateOneAdmin(admin_id, body);
    return Response.json(admin);
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ admin_id: string }> }
) {
  return handleAPIError(async () => {
    const { admin_id } = await params;
    return deleteOneAdminByUserId(admin_id);
  });
}
