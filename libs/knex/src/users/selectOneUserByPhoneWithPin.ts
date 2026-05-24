import { User, APIError } from '@siku-zangu/core';
import { DATABASE } from '../create-database.function';
import {
  rowToUser,
  USER_TABLE_COLUMN_ALIASES_WITH_PIN,
  buildUserTableJoinsWithPin,
} from './insert-one-user.function';
export async function selectOneUserByPhoneWithPin(
  phone: string
): Promise<User | null> {
  try {
    if (!/^[A-Z]{2}\s\d{6,12}$/.test(phone)) {
      throw { status: 400, message: 'Invalid phone number format' } as APIError;
    }
    console.log('Querying user with phone (including PIN):', phone);
    const user = await buildUserTableJoinsWithPin(DATABASE)
      .where('_phone_number.v', phone)
      .first(USER_TABLE_COLUMN_ALIASES_WITH_PIN);
    if (!user) {
      console.log('No user found for phone:', phone);
      return null;
    }
    const userForLogging = { ...user, pin: user.pin ? '[REDACTED]' : undefined };
    console.log('Raw user data (with PIN):', userForLogging);

    const mappedUser = rowToUser(user);
    const mappedUserForLogging = {
      ...mappedUser,
      kv: { ...mappedUser.kv, pin: mappedUser.kv.pin ? '[REDACTED]' : undefined }
    };
    console.log('Mapped user (with PIN):', mappedUserForLogging);
    return mappedUser;
  } catch (e: any) {
    console.error('selectOneUserByPhoneWithPin error:', e);
    throw {
      status: e.status || 500,
      message: e.message || 'Database error',
      details: e.message,
    } as APIError;
  }
}