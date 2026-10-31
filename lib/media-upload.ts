import type { MediaAsset, MediaFolder } from "@/types/media"

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]

type SignResponse = { uploadUrl: string; apiKey: string; signature: string; fields: Record<string, string> }
type CloudinaryResult = { public_id: string; secure_url: string; width: number; height: number }

/**
 * Admin-side upload: asks the server for a signature (the API secret stays there), then sends the file
 * directly to Cloudinary. Swapping providers later means replacing this one function and `lib/media.ts`.
 */
export async function uploadImage(file: File, folder: MediaFolder, accessToken: string, alt: string): Promise<MediaAsset> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP or AVIF image.")
  if (file.size > MAX_BYTES) throw new Error("That image is larger than 8 MB. Please choose a smaller one.")

  const signResponse = await fetch("/api/admin/media/sign", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ folder }),
  })
  if (signResponse.status === 503) throw new Error("Image uploads are not configured yet (Cloudinary keys missing).")
  if (!signResponse.ok) throw new Error("Could not start the upload. Please sign in again.")
  const signed = (await signResponse.json()) as SignResponse

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", signed.apiKey)
  form.append("signature", signed.signature)
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, value)

  const uploadResponse = await fetch(signed.uploadUrl, { method: "POST", body: form })
  if (!uploadResponse.ok) throw new Error("The image upload failed. Please try again.")
  const result = (await uploadResponse.json()) as CloudinaryResult

  return {
    provider: "cloudinary",
    publicId: result.public_id,
    url: result.secure_url,
    alt,
    width: result.width,
    height: result.height,
  }
}
