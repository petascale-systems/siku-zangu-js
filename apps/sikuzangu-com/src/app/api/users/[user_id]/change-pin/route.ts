import { NextRequest } from 'next/server';
import { APIError } from '@siku-zangu/core';
import { selectOneUserByUserIdWithPin, updateUserPin } from '@siku-zangu/knex';
import { handleAPIError } from '@siku-zangu/core';
import bcrypt from 'bcryptjs';

const WEAK_PINS = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '1122', '2211'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  return handleAPIError(async () => {
    const { user_id } = await params;
    const { currentPin, newPin } = await req.json();
    if (!currentPin || !newPin) {
      throw {
        status: 400,
        message: 'Current PIN and new PIN are required',
      } as APIError;
    }

    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      throw {
        status: 400,
        message: 'PIN must be exactly 4 digits',
      } as APIError;
    }

    if (currentPin === newPin) {
      throw {
        status: 400,
        message: 'New PIN must be different from current PIN',
      } as APIError;
    }
    if (WEAK_PINS.includes(newPin)) {
      throw {
        status: 400,
        message: 'This PIN is too weak. Please choose a different PIN.',
      } as APIError;
    }

    const user = await selectOneUserByUserIdWithPin(user_id);

    if (!user) {
      throw {
        status: 404,
        message: 'User not found',
      } as APIError;
    }

    if (!user.kv?.pin) {
      throw {
        status: 500,
        message: 'User has no stored PIN',
      } as APIError;
    }
    const isCurrentPinValid = await bcrypt.compare(currentPin, user.kv.pin);
    if (!isCurrentPinValid) {
      throw {
        status: 401,
        message: 'Current PIN is incorrect',
      } as APIError;
    }
    const hashedNewPin = await bcrypt.hash(newPin, 10);
    await updateUserPin(user_id, hashedNewPin);
    const updatedUser = await selectOneUserByUserIdWithPin(user_id);
    const userWithoutPin = {
      ...updatedUser,
      kv: {
        ...updatedUser.kv,
        pin: undefined,
      },
    };
    return Response.json(userWithoutPin, { status: 200 });
  });
}