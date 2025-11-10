import {NextRequest} from "next/server";
import {Admin, APIError, EMAIL_AND_PASSWORD_SCHEMA} from "@siku-zangu/core";
import {selectOneAdminByUserId, selectUserIdAndPasswordByEmail} from "@siku-zangu/knex";
import {compareSync} from "bcrypt-ts";
import {SignJWT} from 'jose'
import {cookies} from "next/headers";
import {handleAPIError} from "@siku-zangu/core";

const _sessionSecretKey = new TextEncoder().encode(process.env.S_JWT_SIGNING_KEY || 'IcAchOsEVerSewAChMarKoHI');

function _resolveCookieAuthority(req: NextRequest) {
    return req?.headers?.get('host')?.startsWith('localhost') ? 'localhost' : '.sikuzangu.org'
}

function _encryptSessionData(admin: Admin) {
    return new SignJWT({})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setAudience(admin.user_id || '')
        .setSubject(admin.user_id || '')
        .setExpirationTime('30d')
        .sign(_sessionSecretKey)
}

export async function POST(req: NextRequest) {
    return handleAPIError(async () => {
        const result = EMAIL_AND_PASSWORD_SCHEMA.safeParse(await req.json())
        if (!result.success) return Promise.reject({
            status: 400,
            message: 'Invalid email or password',
            issues: [{path: ['email'], error: 'Invalid email or password'}]
        } as APIError);

        const idAndPwd = await selectUserIdAndPasswordByEmail(result.data.email)
        if (!compareSync(result.data.password, idAndPwd.password)) {
            return Promise.reject({
                status: 400,
                message: 'Invalid email or password',
                issues: [{path: ['email'], error: 'Invalid email or password'}]
            } as APIError);
        }

        const admin = await selectOneAdminByUserId(idAndPwd.user_id)
        const aus = await _encryptSessionData(admin)
        const store = await cookies()
        store.set('_aus', aus, {
            domain: _resolveCookieAuthority(req),
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
        })

        return Response.json(admin, {status: 201})
    })
}