import {selectAdminsPage} from "@siku-zangu/knex";

export async function GET(request: Request) {
    const page = await selectAdminsPage();
    return new Response(JSON.stringify(page));
}
