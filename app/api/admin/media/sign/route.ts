import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { isMediaFolder, signCloudinaryUpload } from "@/lib/media-server"

/** Returns a short-lived signature so the admin browser can upload straight to Cloudinary. */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const body: unknown = await request.json().catch(() => null)
  const folder = typeof body === "object" && body !== null ? (body as { folder?: unknown }).folder : undefined
  if (!isMediaFolder(folder)) return NextResponse.json({ error: "invalid_folder" }, { status: 400 })

  const signed = await signCloudinaryUpload(folder)
  if (!signed) return NextResponse.json({ error: "media_not_configured" }, { status: 503 })
  return NextResponse.json(signed)
}
