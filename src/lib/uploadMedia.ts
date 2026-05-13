import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";

export type MediaType = "image" | "video" | "document";

const SIZE_LIMITS: Record<MediaType, number> = {
  image: 1 * 1024 * 1024,
  video: 5 * 1024 * 1024,
  document: 2 * 1024 * 1024
};

const SIZE_LABELS: Record<MediaType, string> = {
  image: "1 MB",
  video: "5 MB",
  document: "2 MB"
};

export function validateMediaFile(file: File, type: MediaType): string | null {
  if (file.size > SIZE_LIMITS[type]) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} must be smaller than ${SIZE_LABELS[type]}.`;
  }
  return null;
}

type PresignResponse = {
  url: string;
  key: string;
};

async function getPresignedUrl(file: File, type: MediaType): Promise<PresignResponse> {
  const res = await apiClient<ApiSuccessEnvelope<PresignResponse>>("/media/presign", {
    method: "POST",
    body: { filename: file.name, contentType: file.type, mediaType: type }
  });
  return res.data;
}

async function getMetaHandle(s3Key: string, contentType: string): Promise<string> {
  const res = await apiClient<ApiSuccessEnvelope<{ handle: string }>>("/media/meta-upload", {
    method: "POST",
    body: { s3Key, contentType }
  });
  return res.data.handle;
}

export type UploadMediaResult = {
  s3Key: string;
  metaHandle: string;
};

/**
 * Full upload pipeline:
 * 1. Get S3 presigned URL from backend
 * 2. PUT file directly to S3
 * 3. Register the S3 key with Meta via backend → get a media handle
 * Returns both the S3 key and Meta handle for the create-template payload.
 */
export async function uploadMediaToS3(
  file: File,
  type: MediaType,
  onStep?: (step: string) => void
): Promise<UploadMediaResult> {
  onStep?.("Generating presigned URL…");
  const { url, key } = await getPresignedUrl(file, type);

  onStep?.("Uploading to Meta…");
  const [s3Res, metaHandle] = await Promise.all([
    fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } }),
    getMetaHandle(key, file.type)
  ]);

  if (!s3Res.ok) {
    throw new Error(`Failed to upload file to storage (${s3Res.status}).`);
  }

  return {
    s3Key: key,
    metaHandle
  };
}
