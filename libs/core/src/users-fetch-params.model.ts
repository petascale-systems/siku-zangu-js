import {FetchParams} from "./fetch-params.model";

export type UsersFetchParams = FetchParams & {
    q?: string
}