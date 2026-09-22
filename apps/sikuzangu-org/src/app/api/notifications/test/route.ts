import { NextRequest } from 'next/server';
import {handleAPIError} from '@siku-zangu/core';
import {sendPushNotification} from '@siku-zangu/knex';
import { requireAdmin } from '../../require-auth.function';

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
    // Sends a real push notification to a real device.
    await requireAdmin();
        const { userId, title, body, type, data } = await req.json();

        if (!userId) {
            return Response.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const result = await sendPushNotification({
            userId,
            type: type || 'daily_insight',
            title: title || 'Test Notification',
            body: body || 'This is a test notifications from Siku Zangu',
            data,
        });

        return Response.json({
            success: true,
            sent: !!result,
            messageId: result
        });
    });
}