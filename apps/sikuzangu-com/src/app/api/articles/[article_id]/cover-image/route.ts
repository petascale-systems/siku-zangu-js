import {NextRequest} from "next/server";
import {APIError, handleAPIError} from "@siku-zangu/core";
import {selectOneArticleCoverImage, updateOneArticleCoverImage} from "@siku-zangu/knex";

export async function PUT(req: NextRequest, {params}: { params: Promise<{ article_id: string }> }) {
    return handleAPIError(async () => {
        const {article_id} = await params;
        const formData = await req.formData();
        if (!formData.has('cover_image')) {
            return Promise.reject({
                status: 400,
                message: 'Article cover image failed',
                issues: [{path: ['cover_image'], error: 'cover_image is missing'}]
            } as APIError);
        }

        const coverImage = formData.get("cover_image") as File;
        if (coverImage.size > 1000000) {
            return Promise.reject({
                status: 400,
                message: 'Article cover image failed',
                issues: [{path: ['cover_image'], error: 'cover_image is too big'}]
            } as APIError);
        }

        return updateOneArticleCoverImage(article_id, coverImage)
    })
}

export async function GET(req: NextRequest, {params}: { params: Promise<{ article_id: string }> }) {
    return handleAPIError(async () => {
        const {article_id} = await params;
        const coverImage = await selectOneArticleCoverImage(article_id);
        return new Response(coverImage);
    })
}