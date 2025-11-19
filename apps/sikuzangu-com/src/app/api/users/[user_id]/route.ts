import {NextRequest} from 'next/server';
import {deleteOneUserByUserId, selectOneUserByUserId, updateOneUser} from '@siku-zangu/knex';
import {handleAPIError} from "@siku-zangu/core";

export async function GET(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
  return handleAPIError(async () => {
    const {user_id} = await params;
    const user = await selectOneUserByUserId(user_id);
    return Response.json(user, {status: 200});
  })
}

export async function PATCH(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
  return handleAPIError(async () => {
    const {user_id} = await params;
    const body = await req.json();
    const user = await updateOneUser(user_id, body);
    return Response.json(user, {status: 200});
  })
}

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ user_id: string }> }) {
  return handleAPIError(async () => {
    const {user_id} = await params;
    await deleteOneUserByUserId(user_id);
    return new Response(null, {status: 204});
  })
}