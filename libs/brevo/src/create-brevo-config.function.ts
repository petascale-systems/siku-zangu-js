import {BrevoConfig} from "./brevo-config.model";

function _createBrevoConfig() {
    return {
        senderEmail: process.env['S_BREVO_SENDER_EMAIL'] || 'support@m.sikuzangu.org',
        senderFullName: process.env['S_BREVO_SENDER_FULL_NAME'] || 'Siku Zangu',
        apiKey: process.env['S_BREVO_API_KEY'] || '',
    } as BrevoConfig;
}

export const BREVO_CONFIG: BrevoConfig = _createBrevoConfig();