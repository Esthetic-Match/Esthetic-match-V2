import crypto from "crypto";

const algorithm = "aes-256-gcm";

function getMessageEncryptionKey() {
  const key = process.env.MESSAGE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("Missing MESSAGE_ENCRYPTION_KEY");
  }

  const buffer = Buffer.from(key, "base64");

  if (buffer.length !== 32) {
    throw new Error("MESSAGE_ENCRYPTION_KEY must be 32 bytes base64");
  }

  return buffer;
}

export function encryptMessage(text: string) {
  const key = getMessageEncryptionKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptMessage({
  ciphertext,
  iv,
  authTag,
}: {
  ciphertext: string;
  iv: string;
  authTag: string | null;
}) {
  if (!authTag) return "";

  const key = getMessageEncryptionKey();

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}