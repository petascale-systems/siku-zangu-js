import { jwtVerify } from 'jose';
import { getSigningKeyBytes } from '../../require-auth.function';

export function verifyJWT(ausCookie: string) {
  return jwtVerify(ausCookie, getSigningKeyBytes(), { algorithms: ['HS256'] });
}
