import { NextRequest, NextResponse } from "next/server";
import { getAllPendingVisites } from "@/lib/visitesPending";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const all = await getAllPendingVisites();
    const visites = status ? all.filter((v) => v.status === status) : all;
    return NextResponse.json({ visites });
  } catch (error) {
    console.error("List pending visites error:", error);
    return NextResponse.json({ visites: [] });
  }
}
