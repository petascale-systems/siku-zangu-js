import { buildUserTableJoinsWithPin, rowToUser, USER_TABLE_COLUMN_ALIASES_WITH_PIN } from "./insert-one-user.function";
import { DATABASE } from '../create-database.function';
import { APIError } from "@siku-zangu/core";

export async function selectOneUserByUserIdWithPin(userIdHex: string) {
  const userIdBin = Buffer.from(userIdHex.replace(/-/g, ''), 'hex');

  return buildUserTableJoinsWithPin(DATABASE)
    .where('_u.id_user', userIdBin)
    .first(USER_TABLE_COLUMN_ALIASES_WITH_PIN)
    .then(async (row) => {
      if (!row) {
        return Promise.reject({
          status: 404,
          message: 'User not found'
        } as APIError);
      }
      return rowToUser(row);
    });
}