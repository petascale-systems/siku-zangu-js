import {UsersFetchParams} from "./users-fetch-params.model";
import {AdminRole} from "./admin.model";

export type AdminsFetchParams = UsersFetchParams & {
    role?: AdminRole
};