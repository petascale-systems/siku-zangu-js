import { NextRequest } from 'next/server';
import { APIError, USER_ZOD_SCHEMA, AccessToken } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

export async function POST(req: NextRequest) {
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

    const normalizedPhoneNumber = phone_number.trim();
    const user = await selectOneUserByPhone(normalizedPhoneNumber);
    if (!user) {
      throw { status: 401, message: 'Invalid phone number or PIN' } as APIError;
    }

    if (!user.kv.pin) {
      throw {
        status: 500,
        message: 'User has no stored PIN',
        details: 'User has no stored PIN',
      } as APIError;
    }

    if (!(await bcrypt.compare(pin, user.kv.pin))) {
      throw { status: 401, message: 'Invalid phone number or PIN' } as APIError;
    }


    const validatedUser = {
      ...user,
      kv: {
        ...user.kv,
        pin: '1234',
      },
    };

    const validation = USER_ZOD_SCHEMA.safeParse(validatedUser);
    if (!validation.success) {
      const issues = validation.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      console.error('Validation failed:', issues);
      throw {
        status: 500,
        message: 'Invalid user data',
        details: issues,
      } as APIError;
    }

    const tokenPayload = {
      user_id: user.user_id,
      phone_number: user.kv.phone_number,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const expiresIn = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days in seconds

    const accessToken: AccessToken = {
      token,
      expires_in: expiresIn,
      user,
    };

    return Response.json(accessToken, { status: 200, headers });
  } catch (e: any) {
    console.error('Auth error:', e);
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