import {FetchParams} from "./fetch-params.model";
import {ArticleStatus} from "./article.model";

export type ArticlesFetchParams = FetchParams & {
    status?: ArticleStatus;
    q?: string;
}