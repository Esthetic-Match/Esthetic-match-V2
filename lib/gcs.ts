import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const privateBucket = storage.bucket(process.env.GCS_PRIVATE_BUCKET_NAME!);

export const publicBucket = storage.bucket(process.env.GCS_PUBLIC_BUCKET_NAME!);

export function getBucketByUploadType(type: string) {
  const publicTypes = ["banner", "profile", "avatar"];

  return publicTypes.includes(type) ? publicBucket : privateBucket;
}

export function getBucketNameByUploadType(type: string) {
  const publicTypes = ["banner", "profile", "avatar"];

  return publicTypes.includes(type)
    ? process.env.GCS_PUBLIC_BUCKET_NAME!
    : process.env.GCS_PRIVATE_BUCKET_NAME!;
}