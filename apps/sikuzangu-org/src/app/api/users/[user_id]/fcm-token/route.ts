import { NextRequest } from 'next/server';
import {handleAPIError} from '@siku-zangu/core';
import {updateOneUser} from '@siku-zangu/knex';
import { requireSelfOrAdmin } from '../../../require-auth.function';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ user_id: string }> }
) {
    return handleAPIError(async () => {
        const { user_id } = await params;
    await requireSelfOrAdmin(req, user_id);
        const body = await req.json();
        const { fcm_token } = body;

        if (!fcm_token || typeof fcm_token !== 'string') {
            return Response.json(
                { error: 'Invalid FCM token' },
                { status: 400 }
            );
        }

        // Update user with FCM token
        const user = await updateOneUser(user_id, {
            kv: { fcm_token }
        });

        console.log(`✅ FCM token saved for user ${user_id}`);
        return Response.json({ success: true, user }, { status: 200 });
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ user_id: string }> }
) {
    return handleAPIError(async () => {
        const { user_id } = await params;
    await requireSelfOrAdmin(req, user_id);

        // Remove FCM token
        await updateOneUser(user_id, {
            kv: { fcm_token: undefined }
        });

        console.log(`🗑️ FCM token removed for user ${user_id}`);
        return Response.json({ success: true }, { status: 200 });
    });
}