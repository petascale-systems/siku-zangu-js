// app/api/auth/request-pin-reset/route.ts
import { NextRequest } from 'next/server';
import { APIError, handleAPIError } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

function toE164(storedPhone: string): string {
    console.log('[DEBUG] Input storedPhone:', storedPhone);

    // storedPhone: "KE 712345678" or "TZ 712345678"
    const [countryCode, ...numberParts] = storedPhone.split(' ');
    const phoneDigits = numberParts.join('').replace(/\D/g, '').replace(/^0/, '');

    console.log('[DEBUG] Extracted countryCode:', countryCode);
    console.log('[DEBUG] Extracted phoneDigits:', phoneDigits);

    let e164: string;
    if (countryCode === 'KE') {
        e164 = `+254${phoneDigits}`;
    } else if (countryCode === 'TZ') {
        e164 = `+255${phoneDigits}`;
    } else {
        // Default to Kenya
        e164 = `+254${phoneDigits}`;
    }

    console.log('[DEBUG] Final E164:', e164);
    return e164;
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number } = await req.json();

        console.log('[DEBUG] Received phone_number:', phone_number);

        if (!phone_number) {
            throw { status: 400, message: 'Phone number is required' } as APIError;
        }

        // Check user exists — but always return 200 to prevent enumeration
        const user = await selectOneUserByPhone(phone_number);
        console.log('[DEBUG] User found:', !!user);

        if (user) {
            const e164Number = toE164(phone_number);
            console.log('[DEBUG] Sending SMS to:', e164Number);

            try {
                await client.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
                    .verifications.create({ to: e164Number, channel: 'sms' });
                console.log('[DEBUG] SMS sent successfully');
            } catch (twilioError: any) {
                console.error('[DEBUG] Twilio error:', twilioError.message);
                throw twilioError;
            }
        }

        return Response.json({ message: 'If this number is registered, a code will be sent.' }, { status: 200 });
    });
}