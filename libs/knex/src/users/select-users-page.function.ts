import {Page, User, UsersFetchParams} from "@siku-zangu/core";
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {DATABASE} from "../create-database.function";

export async function selectUsersPage(params: UsersFetchParams) {
    if (!params.page) params.page = 1;
    if (!params.size) params.size = 20;
    if (params.q) params.q = params.q.toUpperCase().trim();

    let baseQuery = buildUserTableJoins(DATABASE)
    if (params.q) {
        baseQuery = baseQuery
            .whereRaw(`lower(_email.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_phone_number.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_first_name.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_last_name.v) like "%${params.q}%"`)
    }

    const users = await baseQuery.clone().select(USER_TABLE_COLUMN_ALIASES)
        .offset((params.page - 1) * params.size).limit(params.size)
        .orderBy("_u.created_at", "desc")
        .then(rows => rows.map(row => rowToUser(row)))
    const countOfUsers = await baseQuery.clone().count<{ count: number }>({count: '*'})
        .first()
        .then(count => Number(count?.count || 0))

    return {
        size: Number(params.size),
        page: Number(params.page),
        totalItems: Number(countOfUsers),
        totalPages: Math.ceil(Number(countOfUsers) / Number(params.size)),
        items: users
    } as Page<User>
}