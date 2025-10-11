import { NextRequest } from 'next/server';
import { APIError, User, USER_ZOD_SCHEMA } from '@siku-zangu/core';
import { insertOneUser, selectUsersPage } from '@siku-zangu/knex';

export async function POST(req: NextRequest) {
  console.log('=== BACKEND: POST /api/users STARTED ===');
  console.log('Request headers:', Object.fromEntries(req.headers));
  console.log('Request URL:', req.url);

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const body = await req.json();
    console.log('BACKEND: User data:', body);

    // Validate payload
    const validation = USER_ZOD_SCHEMA.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      console.error('BACKEND: Validation failed:', issues);
      throw {
        status: 400,
        message: 'Invalid user data',
        details: issues,
      } as APIError;
    }

    const user = await insertOneUser(body as User);
    console.log('BACKEND: User created:', user);
    return Response.json(user, { status: 201, headers });
  } catch (e: any) {
    console.error('BACKEND: POST /api/users failed:', e);
    console.log('=== BACKEND: POST /api/users FAILED ===');
    return Response.json(
      {
        status: e.status || 500,
        message: e.message || 'Server error',
        details: e.details || e.message || 'Unknown error',
      } as APIError,
      { status: e.status || 500, headers }
    );
  }
}

export async function GET(req: NextRequest) {
  console.log('=== BACKEND: GET /api/users STARTED ===');
  console.log('Request headers:', Object.fromEntries(req.headers));
  console.log('Request URL:', req.url);

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const page = await selectUsersPage({
      page: parseInt(req.nextUrl.searchParams.get('page') || '1'),
      size: parseInt(req.nextUrl.searchParams.get('size') || '20'),
      q: req.nextUrl.searchParams.get('q') || '',
    });
    console.log('BACKEND: Users page:', page);
    return Response.json(page, { status: 200, headers });
  } catch (e: any) {
    console.error('BACKEND: GET /api/users failed:', e);
    console.log('=== BACKEND: GET /api/users FAILED ===');
    return Response.json(
      {
        status: e.status || 500,
        message: e.message || 'Server error',
        details: e.message,
      } as APIError,
      { status: e.status || 500, headers }
    );
  }
}
