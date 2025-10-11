import { User, APIError } from '@siku-zangu/core';
import { DATABASE } from '../create-database.function';
import {
  rowToUser,
  USER_TABLE_COLUMN_ALIASES,
  buildUserTableJoins,
} from './insert-one-user.function';

export async function selectOneUserByPhone(
  phone: string
): Promise<User | null> {
  try {
    if (!/^[A-Z]{2}\s\d{6,12}$/.test(phone)) {
      throw { status: 400, message: 'Invalid phone number format' } as APIError;
    }

    console.log('Querying user with phone:', phone);
    const user = await buildUserTableJoins(DATABASE)
      .where('_phone_number.v', phone)
      .first(USER_TABLE_COLUMN_ALIASES);

    if (!user) {
      console.log('No user found for phone:', phone);
      return null;
    }

    console.log('Raw user data:', user);
    const mappedUser = rowToUser(user);
    console.log('Mapped user:', mappedUser);
    return mappedUser;
  } catch (e: any) {
    console.error('selectOneUserByPhone error:', e);
    throw {
      status: e.status || 500,
      message: e.message || 'Database error',
      details: e.message,
    } as APIError;
  }
}
