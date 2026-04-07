import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "espaces/" });
    const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

    const fixed: string[] = [];
    const skipped: string[] = [];

    for (const blob of jsonBlobs) {
      const res = await fetch(blob.url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = (await res.json()) as EspaceData;
      const match = data.name.match(/^(.+)\s+\(\d+\)$/);

      if (match) {
        data.name = match[1];
        await put(blob.pathname, JSON.stringify(data, null, 2), {
          access: "public",
          contentType: "application/json",
          addRandomSuffix: false,
        });
        fixed.push(`${data.slug}: "${match[0]}" → "${data.name}"`);
      } else {
        skipped.push(`${data.slug}: "${data.name}" (OK)`);
      }
    }

    return NextResponse.json({ fixed, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
