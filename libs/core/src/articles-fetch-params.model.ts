import {FetchParams} from "./fetch-params.model";
import {ArticleStatus} from "./article.model";
import {Language} from "./user.model";

export type ArticlesFetchParams = FetchParams & {
    status?: ArticleStatus;
    q?: string;
    language?: Language;
}