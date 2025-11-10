import {BrevoConfig} from "./brevo-config.model";
import {TransactionalEmailsApi} from "@getbrevo/brevo";
import {BREVO_CONFIG} from "./create-brevo-config.function";

function _createBrevoTxEmailAPI(config: BrevoConfig) {
    const api = new TransactionalEmailsApi();
    (api as any).authentications.apiKey.apiKey = config.apiKey;
    return api;
}

export const BREVO_TX_EMAIL_API: TransactionalEmailsApi = _createBrevoTxEmailAPI(BREVO_CONFIG);