/**
 * React Native compatible exports from @siku-zangu/react
 * Use this entry point for React Native/Expo apps to avoid bundling web-only components
 *
 * Usage: import {useUser, ACCESS_TOKEN_KEY} from '@siku-zangu/react/native'
 */

// Users - hooks and utilities
export { useUser } from './users/use-user.function';
export { fetchUserById, updateUser } from './users/use-user.shared';
export { useAccessToken, ACCESS_TOKEN_KEY } from './users/use-access-token.function';

// Articles - hooks only (not ArticleCard component which uses Next.js)
export { useArticle, ARTICLE_COVER_IMAGE_API_PATH } from './articles/use-article.function';
export { useArticlesPage } from './articles/use-articles-page.function';

// Shared utilities
export { _createFetchConfig, FETCH_CONFIG } from './create-fetch-config.function';
export { patchJSON } from './patch-json.function';
export { postJSON } from './post-json.function';
export { setAuthToken, getAuthToken, authHeaders } from './auth-token.function';

// Query runtime
export { XUIQuery } from './xui-query.provider.component';
export { useAppStateFocus } from './use-app-state-focus.function.native';
export { queryKeys } from './query-keys.function';