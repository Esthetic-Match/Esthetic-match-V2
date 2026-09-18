import { randomUUID } from "crypto";

export type PostOpMediaPurpose =
  | "TEMPLATE"
  | "CASE"
  | "PATIENT_MEDIA";

export const POST_OP_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const POST_OP_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const POST_OP_IMAGE_MAX_BYTES =
  10 * 1024 * 1024; // 10 MB

export const POST_OP_VIDEO_MAX_BYTES =
  250 * 1024 * 1024; // 250 MB

export function isPostOpImageType(
  value: string,
) {
  return (
    POST_OP_IMAGE_TYPES as readonly string[]
  ).includes(value);
}

export function isPostOpVideoType(
  value: string,
) {
  return (
    POST_OP_VIDEO_TYPES as readonly string[]
  ).includes(value);
}

export function getPostOpMediaLimit(
  contentType: string,
) {
  if (isPostOpImageType(contentType)) {
    return POST_OP_IMAGE_MAX_BYTES;
  }

  if (isPostOpVideoType(contentType)) {
    return POST_OP_VIDEO_MAX_BYTES;
  }

  return null;
}

export function getPostOpMediaExtension(
  contentType: string,
) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "video/mp4":
      return "mp4";

    case "video/webm":
      return "webm";

    case "video/quicktime":
      return "mov";

    default:
      return null;
  }
}

function cleanPath(path: string) {
  return path.replace(
    /^\/+|\/+$/g,
    "",
  );
}

export function withPostOpEnvironmentPrefix(
  path: string,
) {
  const clean =
    cleanPath(path);

  if (
    process.env.DEVELOPMENT === "true"
  ) {
    return `DEV/${clean}`;
  }

  return clean;
}

export function createPostOpObjectPath({
  folder,
  contentType,
}: {
  folder: string;
  contentType: string;
}) {
  const extension =
    getPostOpMediaExtension(
      contentType,
    );

  if (!extension) {
    throw new Error(
      "Unsupported PostOp media type.",
    );
  }

  return withPostOpEnvironmentPrefix(
    `${cleanPath(folder)}/${randomUUID()}.${extension}`,
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXTERNAL VIDEOS
═══════════════════════════════════════════════════════════════ */

export function isSupportedExternalVideoUrl(
  value: string,
) {
  try {
    const url = new URL(value);

    const hostname =
      url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    return (
      hostname === "youtube.com" ||
      hostname ===
        "m.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "vimeo.com" ||
      hostname ===
        "player.vimeo.com"
    );
  } catch {
    return false;
  }
}