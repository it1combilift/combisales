import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const resourceType = searchParams.get("type") || "image";

    if (!publicId) {
      return NextResponse.json(
        { error: "Missing publicId query parameter" },
        { status: 400 },
      );
    }

    console.log(
      `[DELETE] Attempting to delete from Cloudinary: ${publicId} (type: ${resourceType})`,
    );

    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType as "image" | "video" | "raw",
      invalidate: true,
    });

    console.log(`[DELETE] Cloudinary response:`, result);

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json({
        success: true,
        cloudinaryId: publicId,
        resourceType: resourceType,
        result: result.result,
      });
    }

    console.error(`[DELETE] Could not delete from Cloudinary: ${publicId}`);
    return NextResponse.json(
      {
        error: `Could not delete from Cloudinary: ${publicId}`,
        cloudinaryResult: result,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("[DELETE] Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file from Cloudinary" },
      { status: 500 },
    );
  }
}
