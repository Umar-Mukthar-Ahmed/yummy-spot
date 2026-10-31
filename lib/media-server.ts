import "server-only"
import { mediaFolders, type MediaFolder } from "@/types/media"

const encoder = new TextEncoder()

async function sha1Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function isMediaFolder(value: unknown): value is MediaFolder {
  return typeof value === "string" && (mediaFolders as readonly string[]).includes(value)
}

export type SignedUpload = {
  uploadUrl: string
  apiKey: string
  signature: string
  fields: Record<string, string>
}

/**
 * Signs a browser-direct upload. The API secret never leaves the server.
 * The incoming transformation caps stored originals at 1600px, so the free storage allowance is not spent on huge files.
 */
export async function signCloudinaryUpload(folder: MediaFolder): Promise<SignedUpload | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""
  const apiKey = process.env.CLOUDINARY_API_KEY ?? ""
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? ""
  if (!cloudName || !apiKey || !apiSecret) return null

  const fields: Record<string, string> = {
    allowed_formats: "jpg,png,webp,heic,avif",
    folder: `yummy-spot/${folder}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
    transformation: "c_limit,w_1600,h_1600,q_auto:good",
  }
  const toSign = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("&")

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    apiKey,
    signature: await sha1Hex(toSign + apiSecret),
    fields,
  }
}
