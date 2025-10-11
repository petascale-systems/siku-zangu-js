import { genSaltSync, hashSync } from 'bcrypt-ts';
export function createBcryptHash(content: string) {
  const salt = genSaltSync(10);
  return hashSync(content, salt);
}
