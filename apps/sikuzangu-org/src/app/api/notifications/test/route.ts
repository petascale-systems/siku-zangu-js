import { NextRequest } from 'next/server';
import { handleAPIError } from '@siku-zangu/core';
import { sendPushNotification } from '@siku-zangu/knex';

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { userId, title, body } = await req.json();

        if (!userId) {
            return Response.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        const result = await sendPushNotification({
            userId,
            type: 'daily_insight',
            title: title || 'Test Notification',
            body: body || 'This is a test notifications from Siku Zangu',
        });

        return Response.json({
            success: true,
            sent: !!result,
            messageId: result
        });
    });
}