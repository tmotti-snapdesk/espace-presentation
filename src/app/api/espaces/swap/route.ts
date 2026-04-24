import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { list, put } from "@vercel/blob";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

async function readEspaceBlob(slug: string): Promise<EspaceData | null> {
  const { blobs } = await list({ prefix: `espaces/${slug}` });
  const jsonBlob = blobs.find((b) => b.pathname === `espaces/${slug}.json`);
  if (!jsonBlob) return null;
  const res = await fetch(jsonBlob.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as EspaceData;
}

export async function POST(request: NextRequest) {
  try {
    const { slugA, slugB } = await request.json();

    if (!slugA || !slugB || slugA === slugB) {
      return NextResponse.json(
        { error: "slugA et slugB requis et différents" },
        { status: 400 }
      );
    }

    const [a, b] = await Promise.all([readEspaceBlob(slugA), readEspaceBlob(slugB)]);

    if (!a) {
      return NextResponse.json({ error: `Espace "${slugA}" introuvable` }, { status: 404 });
    }
    if (!b) {
      return NextResponse.json({ error: `Espace "${slugB}" introuvable` }, { status: 404 });
    }

    const aAtBPath: EspaceData = { ...a, slug: slugB };
    const bAtAPath: EspaceData = { ...b, slug: slugA };

    await Promise.all([
      put(`espaces/${slugB}.json`, JSON.stringify(aAtBPath, null, 2), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
      put(`espaces/${slugA}.json`, JSON.stringify(bAtAPath, null, 2), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
    ]);

    revalidateTag("espaces-list");
    revalidatePath(`/espaces/${slugA}`);
    revalidatePath(`/espaces/${slugB}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      swapped: [
        { from: slugA, to: slugB },
        { from: slugB, to: slugA },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Swap failed";
    console.error("Swap espaces error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
