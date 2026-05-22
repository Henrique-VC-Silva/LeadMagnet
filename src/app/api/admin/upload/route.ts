import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  // 1. Authorize user
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // 2. Validate file existence
    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate image format
    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // 4. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // 5. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Define upload path in the public directory
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // 7. Sanitize filename and prep prefix timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${sanitizedName}`;
    const filePath = join(uploadsDir, filename);

    // 8. Save the file to disk
    await writeFile(filePath, buffer);

    // 9. Return the absolute client path
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
