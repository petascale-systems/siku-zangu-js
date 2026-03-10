import {APIError, User} from '@siku-zangu/core';
import {getJSON} from '../get-json.function';
import {postJSON} from '../post-json.function';
import {patchJSON} from '../patch-json.function';
import {deleteJSON} from '../delete-json.function';

export const USERS_API_PATH = '/api/users';
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`;
export const CHANGE_PIN_API_PATH = (id: string) => `/api/users/${id}/change-pin`;
export const REQUEST_PIN_RESET_API_PATH = '/api/auth/request-pin-reset';
export const VERIFY_OTP_API_PATH = '/api/auth/verify-otp';
export const RESET_PIN_API_PATH = '/api/auth/reset-pin';

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
    return patchJSON<{currentPin: string; newPin: string}, User>(
        CHANGE_PIN_API_PATH(userId),
        {currentPin, newPin}
    );
}

export async function requestPinReset(phoneNumber: string): Promise<void> {
    return postJSON<{phone_number: string}, void>(
        REQUEST_PIN_RESET_API_PATH,
        {phone_number: phoneNumber}
    );
}

export async function verifyPinResetOtp(
    phoneNumber: string,
    code: string
): Promise<{reset_token: string}> {
    return postJSON<{phone_number: string; code: string}, {reset_token: string}>(
        VERIFY_OTP_API_PATH,
        {phone_number: phoneNumber, code}
    );
}

export async function resetUserPin(
    phoneNumber: string,
    resetToken: string,
    newPin: string
): Promise<User | void> {
    return postJSON<{phone_number: string; reset_token: string; new_pin: string}, User>(
        RESET_PIN_API_PATH,
        {phone_number: phoneNumber, reset_token: resetToken, new_pin: newPin}
    );
}