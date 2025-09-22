import {FetchParams} from "./fetch-params.model";

export type AdminsFetchParams = FetchParams & {
    q?: string
}