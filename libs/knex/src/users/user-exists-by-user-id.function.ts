import {TABLE_NAME_S_USER} from '../table-names'
import {DATABASE} from '../create-database.function';

export async function userExistsByUserId(userIdHex: string) {
    return DATABASE
        .from(TABLE_NAME_S_USER)
        .where('id_user', Buffer.from(userIdHex.replace('-', ''), 'hex'))
        .count<{ count: number }>({count: '*'})
        .first()
        .then((count) => count && count.count > 0)
}