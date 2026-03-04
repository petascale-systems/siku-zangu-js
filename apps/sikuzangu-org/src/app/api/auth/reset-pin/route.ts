// app/api/auth/reset-pin/route.ts
import { NextRequest } from 'next/server';
import { APIError, handleAPIError } from '@siku-zangu/core';
import {
    selectOneUserByPhone,
    selectOneUserByUserIdWithPin,
    updateUserPin,
} from '@siku-zangu/knex';
import { consumeResetToken } from '../verify-otp/route';
import bcrypt from 'bcryptjs';

const WEAK_PINS = [
    '0000', '1111', '2222', '3333', '4444',
    '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1122', '2211',
];

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const { phone_number, reset_token, new_pin } = await req.json();

        console.log('[RESET-PIN DEBUG] Received phone_number:', phone_number);
        console.log('[RESET-PIN DEBUG] Received reset_token:', reset_token);
        console.log('[RESET-PIN DEBUG] Received new_pin:', new_pin ? '****' : 'undefined');

        if (!phone_number || !reset_token || !new_pin) {
            throw {
                status: 400,
                message: 'Phone number, reset token, and new PIN are required',
            } as APIError;
        }
        if (!/^\d{4}$/.test(new_pin)) {
            throw { status: 400, message: 'PIN must be exactly 4 digits' } as APIError;
        }
        if (WEAK_PINS.includes(new_pin)) {
            throw {
                status: 400,
                message: 'This PIN is too weak. Please choose a different PIN.',
            } as APIError;
        }

        // Validate and consume the single-use reset token
        console.log('[RESET-PIN DEBUG] Attempting to consume token...');
        const tokenValid = consumeResetToken(phone_number, reset_token);
        console.log('[RESET-PIN DEBUG] Token valid:', tokenValid);

        if (!tokenValid) {
            throw {
                status: 401,
                message: 'Reset token is invalid or has expired',
            } as APIError;
        }

        const user = await selectOneUserByPhone(phone_number);
        console.log('[RESET-PIN DEBUG] User found:', !!user);

        if (!user) {
            throw { status: 404, message: 'User not found' } as APIError;
        }

        const userWithPin = await selectOneUserByUserIdWithPin(user.user_id);
        if (!userWithPin?.kv?.pin) {
            throw { status: 500, message: 'User has no stored PIN' } as APIError;
        }

        // Prevent reusing the same PIN
        const isSameAsOld = await bcrypt.compare(new_pin, userWithPin.kv.pin);
        console.log('[RESET-PIN DEBUG] Is same as old PIN:', isSameAsOld);

        if (isSameAsOld) {
            throw {
                status: 400,
                message: 'New PIN must be different from your current PIN',
            } as APIError;
        }

        const hashedNewPin = await bcrypt.hash(new_pin, 10);
        await updateUserPin(user.user_id, hashedNewPin);

        console.log('[RESET-PIN DEBUG] PIN updated successfully');

        // Mirror changePin: return user without pin hash
        const updatedUser = await selectOneUserByUserIdWithPin(user.user_id);
        const userWithoutPin = {
            ...updatedUser,
            kv: { ...updatedUser.kv, pin: undefined },
        };

        return Response.json(userWithoutPin, { status: 200 });
    });
}