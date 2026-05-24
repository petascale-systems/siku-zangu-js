import { NextRequest } from 'next/server';
import { APIError, handleAPIError, toE164 } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number } = await req.json();

        if (!phone_number) {
            throw { status: 400, message: 'Phone number is required' } as APIError;
        }
        const user = await selectOneUserByPhone(phone_number);

        if (user) {
            const e164Number = toE164(phone_number);

            try {
                await client.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
                    .verifications.create({ to: e164Number, channel: 'sms' });
            } catch (twilioError: any) {
                throw twilioError;
            }
        }

        return Response.json({ message: 'If this number is registered, a code will be sent.' }, { status: 200 });
    });
}