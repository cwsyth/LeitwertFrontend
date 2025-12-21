import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const locale = process.env.LOCALE ?? process.env.NEXT_PUBLIC_LOCALE ?? "en-GB";
    const timezone = process.env.TIMEZONE ?? process.env.NEXT_PUBLIC_TIMEZONE ?? "Europe/Berlin";

    return NextResponse.json(
        { locale, timezone },
        { headers: { "Cache-Control": "no-store" } }
    );
}
