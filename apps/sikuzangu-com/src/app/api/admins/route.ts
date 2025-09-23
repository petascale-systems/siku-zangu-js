import {selectAdminsPage} from "@siku-zangu/knex";
import {NextRequest} from "next/server";

export async function GET(req: NextRequest) {
    const page = await selectAdminsPage({});
    return new Response(JSON.stringify(page));
}

export async function POST(req: NextRequest) {

}