/**
 * Map of ISO 3166-1 alpha-2 country codes to international dialing codes
 * for all 54 African countries.
 */
const AFRICAN_DIAL_CODES: Record<string, string> = {
    DZ: '+213',
    AO: '+244',
    BJ: '+229',
    BW: '+267',
    BF: '+226',
    BI: '+257',
    CV: '+238',
    CM: '+237',
    CF: '+236',
    TD: '+235',
    KM: '+269',
    CG: '+242',
    CD: '+243',
    CI: '+225',
    DJ: '+253',
    EG: '+20',
    GQ: '+240',
    ER: '+291',
    SZ: '+268',
    ET: '+251',
    GA: '+241',
    GM: '+220',
    GH: '+233',
    GN: '+224',
    GW: '+245',
    KE: '+254',
    LS: '+266',
    LR: '+231',
    LY: '+218',
    MG: '+261',
    MW: '+265',
    ML: '+223',
    MR: '+222',
    MU: '+230',
    MA: '+212',
    MZ: '+258',
    NA: '+264',
    NE: '+227',
    NG: '+234',
    RW: '+250',
    ST: '+239',
    SN: '+221',
    SC: '+248',
    SL: '+232',
    SO: '+252',
    ZA: '+27',
    SS: '+211',
    SD: '+249',
    TZ: '+255',
    TG: '+228',
    TN: '+216',
    UG: '+256',
    ZM: '+260',
    ZW: '+263',
};

/**
 * Converts a stored phone number (e.g. "KE 716899396") to E.164 format (e.g. "+254716899396").
 * Supports all 54 African country codes.
 */
export function toE164(storedPhone: string): string {
    const [countryCode, ...numberParts] = storedPhone.split(' ');
    const phoneDigits = numberParts.join('').replace(/\D/g, '').replace(/^0/, '');
    const dialCode = AFRICAN_DIAL_CODES[countryCode];
    if (!dialCode) {
        throw new Error(`Unsupported country code: ${countryCode}`);
    }
    return `${dialCode}${phoneDigits}`;
}
