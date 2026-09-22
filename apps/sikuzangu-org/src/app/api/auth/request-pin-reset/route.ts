import { NextRequest } from 'next/server';
import {APIError, handleAPIError, toE164} from '@siku-zangu/core';
import {selectOneUserByPhone} from '@siku-zangu/knex';
import { getTwilioClient, getVerifyServiceSid } from '../../twilio-client.function';

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
                await getTwilioClient().verify.v2
                    .services(getVerifyServiceSid())
                    .verifications.create({ to: e164Number, channel: 'sms' });
            } catch (twilioError: any) {
                throw twilioError;
            }
        }

        return Response.json({ message: 'If this number is registered, a code will be sent.' }, { status: 200 });
    });
}