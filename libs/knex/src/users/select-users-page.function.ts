import {Page, User, UsersFetchParams} from "@siku-zangu/core";
import {buildUserTableJoins, rowToUser, USER_TABLE_COLUMN_ALIASES} from "./insert-one-user.function";
import {DATABASE} from "../create-database.function";

export async function selectUsersPage(params: UsersFetchParams) {
    if (!params.page) params.page = 1;
    if (!params.size) params.size = 20;

    const baseQuery = buildUserTableJoins(DATABASE)
    const users = await baseQuery.clone().select(USER_TABLE_COLUMN_ALIASES)
        .offset(params.size).limit(params.size)
        .orderBy("_u.created_at", "desc")
        .then(rows => rows.map(row => rowToUser(row)))
    const countOfUsers = await baseQuery.clone().count<{ count: number }>({count: '*'})
        .then(count => Number(count.count))

    return {
        size: Number(params.size),
        page: Number(params.page),
        totalItems: Number(countOfUsers),
        totalPages: Math.ceil(Number(countOfUsers) / Number(params.size)),
        items: users
    } as Page<User>
}