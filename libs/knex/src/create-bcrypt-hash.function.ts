import { genSaltSync, hashSync } from 'bcrypt-ts';

/**
 * Generates the Bcrypt sum of plain text.
 *
 * @param content Plain text to be hashed.
 */
export function createBcryptHash(content: string) {
    const salt = genSaltSync(10);
    return hashSync(content, salt);
}