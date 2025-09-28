import { NextRequest } from 'next/server';
import { APIError, USER_ZOD_SCHEMA } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  console.log('=== BACKEND: POST /api/users/auth STARTED ===');

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const { phone_number, pin } = await req.json();

    if (!phone_number || !pin || !/^\d{4}$/.test(pin)) {
      throw {
        status: 400,
        message: 'Phone number and 4-digit PIN are required',
      } as APIError;
    }

    const user = await selectOneUserByPhone(phone_number);
    if (!user) {
      throw { status: 401, message: 'Invalid phone number or PIN' } as APIError;
    }

    if (!user.kv.pin) {
      console.error('Missing PIN for user:', user);
      throw {
        status: 500,
        message: 'User has no stored PIN',
        details: 'User has no stored PIN',
      } as APIError;
    }

    if (!(await bcrypt.compare(pin, user.kv.pin))) {
      throw { status: 401, message: 'Invalid phone number or PIN' } as APIError;
    }

    const validation = USER_ZOD_SCHEMA.safeParse(user);
    if (!validation.success) {
      const issues = validation.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw {
        status: 500,
        message: 'Invalid user data',
        details: issues,
      } as APIError;
    }
    return Response.json(user, { status: 200, headers });
  } catch (e: any) {
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
