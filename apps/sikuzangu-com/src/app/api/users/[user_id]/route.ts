import { NextRequest } from 'next/server';
import { APIError } from '@siku-zangu/core';
import { deleteOneUserByUserId, selectOneUserByUserId, updateOneUser } from '@siku-zangu/knex';

function corsHeaders() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  try {
    const { user_id } = await params;
    const user = await selectOneUserByUserId(user_id);
    return Response.json(user, { status: 200, headers });
  } catch (e: any) {
    return Response.json(
      { status: e.status || 500, message: e.message || 'Server error' } as APIError,
      { status: e.status || 500, headers }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  try {
    const { user_id } = await params;
    const body = await req.json();
    const user = await updateOneUser(user_id, body);
    return Response.json(user, { status: 200, headers });
  } catch (e: any) {
    return Response.json(
      { status: e.status || 500, message: e.message || 'Server error' } as APIError,
      { status: e.status || 500, headers }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  try {
    const { user_id } = await params;
    await deleteOneUserByUserId(user_id);
    return new Response(null, { status: 204, headers });
  } catch (e: any) {
    return Response.json(
      { status: e.status || 500, message: e.message || 'Server error' } as APIError,
      { status: e.status || 500, headers }
    );
  }
}