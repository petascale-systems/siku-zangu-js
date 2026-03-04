// app/api/auth/verify-otp/route.ts
import { NextRequest } from 'next/server';
import { APIError, handleAPIError } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import twilio from 'twilio';
import crypto from 'crypto';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

// ── Reset token store ────────────────────────────────────────────────────────
const resetTokenStore = new Map<string, { token: string; expiresAt: number }>();
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function storeResetToken(phoneNumber: string, token: string): void {
    resetTokenStore.set(phoneNumber, {
        token,
        expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });
}

export function consumeResetToken(phoneNumber: string, token: string): boolean {
    console.log('[CONSUME-TOKEN DEBUG] Looking for token for phone:', phoneNumber);
    console.log('[CONSUME-TOKEN DEBUG] Provided token:', token);
    console.log('[CONSUME-TOKEN DEBUG] Store size:', resetTokenStore.size);
    console.log('[CONSUME-TOKEN DEBUG] Store keys:', Array.from(resetTokenStore.keys()));

    const entry = resetTokenStore.get(phoneNumber);
    console.log('[CONSUME-TOKEN DEBUG] Found entry:', !!entry);

    if (!entry) {
        console.log('[CONSUME-TOKEN DEBUG] No entry found in store');
        return false;
    }

    const now = Date.now();
    console.log('[CONSUME-TOKEN DEBUG] Now:', now);
    console.log('[CONSUME-TOKEN DEBUG] Expires at:', entry.expiresAt);
    console.log('[CONSUME-TOKEN DEBUG] Time remaining (ms):', entry.expiresAt - now);

    if (now > entry.expiresAt) {
        console.log('[CONSUME-TOKEN DEBUG] Token expired');
        resetTokenStore.delete(phoneNumber);
        return false;
    }

    console.log('[CONSUME-TOKEN DEBUG] Stored token:', entry.token);
    console.log('[CONSUME-TOKEN DEBUG] Tokens match:', entry.token === token);

    if (entry.token !== token) {
        console.log('[CONSUME-TOKEN DEBUG] Token mismatch');
        return false;
    }

    resetTokenStore.delete(phoneNumber);
    console.log('[CONSUME-TOKEN DEBUG] Token consumed successfully');
    return true;
}

function toE164(storedPhone: string): string {
    console.log('[VERIFY-OTP DEBUG] Input storedPhone:', storedPhone);

    const [countryCode, ...numberParts] = storedPhone.split(' ');
    const phoneDigits = numberParts.join('').replace(/\D/g, '').replace(/^0/, '');

    console.log('[VERIFY-OTP DEBUG] countryCode:', countryCode);
    console.log('[VERIFY-OTP DEBUG] phoneDigits:', phoneDigits);

    let e164: string;
    if (countryCode === 'KE') {
        e164 = `+254${phoneDigits}`;
    } else if (countryCode === 'TZ') {
        e164 = `+255${phoneDigits}`;
    } else {
        e164 = `+254${phoneDigits}`;
    }

    console.log('[VERIFY-OTP DEBUG] Final E164:', e164);
    return e164;
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number, code } = await req.json();

        console.log('[VERIFY-OTP DEBUG] Received phone_number:', phone_number);
        console.log('[VERIFY-OTP DEBUG] Received code:', code);

        if (!phone_number || !code) {
            throw { status: 400, message: 'Phone number and code are required' } as APIError;
        }
        if (!/^\d{6}$/.test(code)) {
            throw { status: 400, message: 'Code must be exactly 6 digits' } as APIError;
        }

        let check;
        try {
            const e164 = toE164(phone_number);
            console.log('[VERIFY-OTP DEBUG] Checking code with Twilio for:', e164);

            check = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
                .verificationChecks
                .create({
                    to: e164,
                    code: code
                });

            console.log('[VERIFY-OTP DEBUG] Twilio check status:', check.status);
        } catch (err: any) {
            console.error('[VERIFY-OTP DEBUG] Twilio error:', err);
            if (err?.code === 60200) {
                throw { status: 400, message: 'Invalid or already used code' } as APIError;
            }
            throw { status: 500, message: 'Failed to verify code' } as APIError;
        }

        if (check.status === 'expired') {
            throw { status: 410, message: 'Code has expired' } as APIError;
        }
        if (check.status !== 'approved') {
            throw { status: 400, message: 'Incorrect code' } as APIError;
        }

        // Use selectOneUserByPhone (not selectOneUserByPhoneNumber)
        const user = await selectOneUserByPhone(phone_number);
        console.log('[VERIFY-OTP DEBUG] User found:', !!user);

        if (!user) {
            throw { status: 404, message: 'User not found' } as APIError;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        storeResetToken(phone_number, resetToken);

        console.log('[VERIFY-OTP DEBUG] Reset token created');
        return Response.json({ reset_token: resetToken }, { status: 200 });
    });
}