import { DATABASE } from '../create-database.function';
import { TABLE_NAME_S_USER_KV } from '../table-names';

export async function isTakenPhoneNumber(phone: string, userId?: Buffer) {
  let query = DATABASE.from(TABLE_NAME_S_USER_KV).where({
    k: 'phone_number',
    v: phone,
  });
  if (userId) query = query.andWhereNot('id_user', userId);
  return query
    .count<{ count: number }>({ count: '*' })
    .first()
    .then((count) =>  count && count?.count > 0);
}
