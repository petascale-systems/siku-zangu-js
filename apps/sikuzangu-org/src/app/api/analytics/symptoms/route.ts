import { NextRequest } from 'next/server';
import { handleAPIError } from '@siku-zangu/core';
import { selectSymptomCounts, selectSymptomsByDate } from '@siku-zangu/knex';
import { requireAdmin } from '../../require-auth.function';

/**
 * Symptom analytics for the admin dashboard.
 *
 * `requireAdmin`, not `requireSelfOrAdmin` — this is aggregated across every
 * user, so there is no "self" to scope it to.
 *
 * These numbers used to be derived in the browser by looping over the first 500
 * users and parsing their log JSON. Counting is now the database's job, which
 * is both cheaper and the only way to cover every user.
 */
export async function GET(req: NextRequest) {
  return handleAPIError(async () => {
    await requireAdmin();

    const from = req.nextUrl.searchParams.get('from') || undefined;
    const to = req.nextUrl.searchParams.get('to') || undefined;
    const byDate = req.nextUrl.searchParams.get('byDate') === 'true';

    const [counts, series] = await Promise.all([
      selectSymptomCounts({ from, to }),
      byDate ? selectSymptomsByDate({ from, to }) : Promise.resolve([]),
    ]);

    return Response.json({ counts, series }, { status: 200 });
  });
}
