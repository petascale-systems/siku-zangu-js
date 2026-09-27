import { NextRequest } from 'next/server';
import {handleAPIError} from '@siku-zangu/core';
import {selectPeriodHistory} from '@siku-zangu/knex';
import { requireSelfOrAdmin } from '../../../require-auth.function';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  return handleAPIError(async () => {
    const { user_id } = await params;
    await requireSelfOrAdmin(req, user_id);
    const requested = Number(req.nextUrl.searchParams.get('limit') ?? DEFAULT_LIMIT);
    const limit = Number.isFinite(requested)
      ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(requested)))
      : DEFAULT_LIMIT;
    const cycles = await selectPeriodHistory(user_id, limit);
    return Response.json(cycles, { status: 200 });
  });
}
