import {jwtVerify} from "jose";

const _sessionSecretKey = new TextEncoder().encode(process.env.S_JWT_SIGNING_KEY || 'IcAchOsEVerSewAChMarKoHI');

export function verifyJWT(ausCookie: string) {
    return jwtVerify(ausCookie, _sessionSecretKey, {algorithms: ['HS256']})
}