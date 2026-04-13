import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/svg+xml",
            "image/gif",
            "video/mp4",
            "video/quicktime",
            "application/pdf",
          ],
        };
      },
      onUploadCompleted: async () => {
        // Invalidate the asset library so the freshly-uploaded file
        // shows up in the picker without waiting for the 5-min TTL.
        revalidateTag("assets-list");
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
