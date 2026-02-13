import {APIError, User} from '@siku-zangu/core';
import {getJSON} from '../get-json.function';
import {postJSON} from '../post-json.function';
import {patchJSON} from '../patch-json.function';
import {deleteJSON} from '../delete-json.function';

export const USERS_API_PATH = '/api/users';
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`;
export const CHANGE_PIN_API_PATH = (id: string) => `/api/users/${id}/change-pin`;

export async function fetchUserById(id: string): Promise<User> {
    return getJSON<User>(USER_BY_ID_API_PATH(id));
}

export async function createUser(user: User): Promise<User> {
    return postJSON<User, User>(USERS_API_PATH, user);
}

export async function updateUser(userId: string, user: User) {
    return patchJSON<User, User>(USER_BY_ID_API_PATH(userId), user);
}

export async function deleteUserById(userId: string): Promise<undefined | User> {
    return deleteJSON<User>(USER_BY_ID_API_PATH(userId));
}

export async function changeUserPin(
    userId: string,
    currentPin: string,
    newPin: string
): Promise<User | void> {
    return patchJSON<{ currentPin: string; newPin: string }, User>(
        CHANGE_PIN_API_PATH(userId),
        {currentPin, newPin}
    );
}