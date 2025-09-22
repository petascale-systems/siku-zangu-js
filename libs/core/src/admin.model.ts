import {User, UserStatus} from "./user.model";

export type Admin = User & {
    status?: UserStatus;
}