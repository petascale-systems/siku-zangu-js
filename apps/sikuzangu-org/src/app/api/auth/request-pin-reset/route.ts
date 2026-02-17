// app/api/auth/request-pin-reset/route.ts
import { NextRequest } from 'next/server';
import { APIError, handleAPIError } from '@siku-zangu/core';
import { selectOneUserByPhone} from '@siku-zangu/knex';
import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

function toE164(storedPhone: string): string {
    // storedPhone: "TZ 712345678"
    const digits = storedPhone.replace(/\D/g, '');
    const local = digits.startsWith('255')
        ? digits.slice(3)
        : digits.replace(/^0/, '');
    return `+255${local}`;
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number } = await req.json();

        if (!phone_number) {
            throw { status: 400, message: 'Phone number is required' } as APIError;
        }

        // Check user exists — but always return 200 to prevent enumeration
        const user = await selectOneUserByPhoneNumber(phone_number);
        if (user) {
            await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
                .verifications.create({ to: toE164(phone_number), channel: 'sms' });
        }

        return Response.json({ message: 'If this number is registered, a code will be sent.' }, { status: 200 });
    });
}