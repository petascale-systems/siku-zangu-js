import { NextRequest } from 'next/server';
import { APIError, handleAPIError, toE164 } from '@siku-zangu/core';
import { selectOneUserByPhone } from '@siku-zangu/knex';
import twilio from 'twilio';
import crypto from 'crypto';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);
const resetTokenStore = new Map<string, { token: string; expiresAt: number }>();
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

export function storeResetToken(phoneNumber: string, token: string): void {
    resetTokenStore.set(phoneNumber, {
        token,
        expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });
}

export function consumeResetToken(phoneNumber: string, token: string): boolean {

    const entry = resetTokenStore.get(phoneNumber);

    if (!entry) {
        return false;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
        resetTokenStore.delete(phoneNumber);
        return false;
    }

    if (entry.token !== token) {
        return false;
    }

    resetTokenStore.delete(phoneNumber);
    return true;
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number, code } = await req.json();
        if (!phone_number || !code) {
            throw { status: 400, message: 'Phone number and code are required' } as APIError;
        }
        if (!/^\d{6}$/.test(code)) {
            throw { status: 400, message: 'Code must be exactly 6 digits' } as APIError;
        }

        let check;
        try {
            const e164 = toE164(phone_number);

            check = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
                .verificationChecks
                .create({
                    to: e164,
                    code: code
                });
        } catch (err: any) {
            if (err?.code === 60200) {
                throw { status: 400, message: 'Invalid or already used code' } as APIError;
            }
            throw { status: 500, message: 'Failed to verify code' } as APIError;
        }

        if (check.status === 'expired') {
            throw { status: 400, message: 'Code has expired' } as APIError;
        }
        if (check.status !== 'approved') {
            throw { status: 400, message: 'Incorrect code' } as APIError;
        }
        const user = await selectOneUserByPhone(phone_number);

        if (!user) {
            throw { status: 404, message: 'User not found' } as APIError;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        storeResetToken(phone_number, resetToken);
        return Response.json({ reset_token: resetToken }, { status: 200 });
    });
}