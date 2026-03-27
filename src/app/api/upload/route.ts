import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const slug = formData.get("slug") as string;
    const files = formData.getAll("files") as File[];
    const type = formData.get("type") as string; // "photos" | "video" | "floorplan" | "contact"

    if (!slug || !files.length || !type) {
      return NextResponse.json(
        { error: "Missing slug, files, or type" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "espaces", slug);
    await mkdir(uploadDir, { recursive: true });

    const uploadedPaths: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
      const fileName = `${type}-${Date.now()}-${sanitizedName}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      uploadedPaths.push(`/espaces/${slug}/${fileName}`);
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
