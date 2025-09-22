import {FetchConfig} from './fetch-config.model';

export function _createFetchConfig(): FetchConfig {
    return {
        host: process.env.NEXT_PUBLIC_SIKUZANGU_COM_HOST || process.env.EXPO_PUBLIC_SIKUZANGU_COM_HOST || '',
    };
}

export const FETCH_CONFIG = _createFetchConfig();
