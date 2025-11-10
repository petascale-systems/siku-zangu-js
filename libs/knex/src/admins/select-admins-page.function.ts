import {AdminsFetchParams, Page, User} from "@siku-zangu/core";
import {DATABASE} from "../create-database.function";
import {ADMIN_TABLE_COLUMN_ALIASES, buildAdminTableJoins, rowToAdmin} from "./insert-one-admin.function";

export async function selectAdminsPage(params: AdminsFetchParams) {
    if (!params.page) params.page = 1;
    if (!params.size) params.size = 20;
    if (params.q) params.q = params.q.toUpperCase().trim();

    let baseQuery = buildAdminTableJoins(DATABASE)
    if (params.q) {
        baseQuery = baseQuery
            .whereRaw(`lower(_email.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_phone_number.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_first_name.v) like "%${params.q}%"`)
            .orWhereRaw(`lower(_last_name.v) like "%${params.q}%"`)
    }

    const admins = await baseQuery.clone().select(ADMIN_TABLE_COLUMN_ALIASES)
        .offset((params.page - 1) * params.size).limit(params.size)
        .orderBy("_u.created_at", "desc")
        .then(rows => rows.map(row => rowToAdmin(row)))
    const count = await baseQuery.clone().count<{ count: number }>({count: '*'})
        .first()
        .then(count => Number(count?.count || 0))

    return {
        size: Number(params.size),
        page: Number(params.page),
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / Number(params.size)),
        items: admins
    } as Page<User>
}