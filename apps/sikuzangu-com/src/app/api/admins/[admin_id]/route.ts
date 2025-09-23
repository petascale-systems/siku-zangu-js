import {NextRequest} from "next/server";

export async function GET(req: NextRequest, {params}: { params: Promise<{ admin_id: string }> }) {
    const {admin_id} = await params
    console.log(req.nextUrl.searchParams, admin_id);
    return Response.json({q: req.nextUrl.searchParams.get('q'), admin_id});
}

export async function PUT(req: NextRequest) {
    return Response.json({});
}

