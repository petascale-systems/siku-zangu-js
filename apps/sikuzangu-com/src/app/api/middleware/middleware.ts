import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { APIError } from '@siku-zangu/core';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

export interface JWTPayload {
  user_id: string;
  phone_number: string;
  iat: number;
  exp: number;
}

export function verifyJWT(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw {
      status: 401,
      message: 'Invalid or expired token',
    } as APIError;
  }
}

export function extractBearerToken(req: NextRequest): string {
  const authorization = req.headers.get('authorization');

  if (!authorization) {
    throw {
      status: 401,
      message: 'Authorization header required',
    } as APIError;
  }

  if (!authorization.startsWith('Bearer ')) {
    throw {
      status: 401,
      message: 'Bearer token required',
    } as APIError;
  }

  return authorization.substring(7); // Remove 'Bearer ' prefix
}

export function requireAuth(req: NextRequest): JWTPayload {
  const token = extractBearerToken(req);
  return verifyJWT(token);
}


export async function protectedRouteExample(req: NextRequest) {
  try {
    const user = requireAuth(req);
  } catch (e: any) {
    return Response.json(
      {
        status: e.status || 401,
        message: e.message || 'Unauthorized',
      } as APIError,
      { status: e.status || 401 }
    );
  }
}