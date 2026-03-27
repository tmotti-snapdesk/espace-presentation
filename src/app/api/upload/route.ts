import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
