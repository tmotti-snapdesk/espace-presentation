import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Vercel Blob not configured. Please connect a Blob Store to this project in Vercel Dashboard > Storage." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const slug = formData.get("slug") as string;
    const files = formData.getAll("files") as File[];
    const type = formData.get("type") as string;

    if (!slug || !files.length || !type) {
      return NextResponse.json(
        { error: "Missing slug, files, or type" },
        { status: 400 }
      );
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
      const pathname = `espaces/${slug}/${type}-${Date.now()}-${sanitizedName}`;

      const blob = await put(pathname, file, {
        access: "public",
      });

      uploadedPaths.push(blob.url);
    }

    return NextResponse.json({ paths: uploadedPaths });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
