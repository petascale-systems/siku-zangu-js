import {User} from "@siku-zangu/core";
import {DATABASE} from "@siku-zangu/knex";

export function insertOneUser(user: User): User {
    DATABASE.insert({})
    return {}
}