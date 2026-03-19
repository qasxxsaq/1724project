import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Readable } from "stream";

type StoredDocument = {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
};

type UploadInput = {
  originalName: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type DownloadResult = {
  stream: Readable;
  filename: string;
  mimetype: string;
  size?: number;
};

const uploadsDir = path.join(__dirname, "../../uploads");

const getProvider = () => process.env.STORAGE_PROVIDER?.toLowerCase() || "local";

let _supabase: SupabaseClient | null = null;

const getSupabase = (): { client: SupabaseClient; bucket: string } => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!url || !key || !bucket) {
    throw new Error(
      `Supabase storage is not fully configured (URL=${!!url}, KEY=${!!key}, BUCKET=${!!bucket})`
    );
  }

  if (!_supabase) {
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return { client: _supabase, bucket };
};

const ensureUploadsDir = async () => {
  await fs.promises.mkdir(uploadsDir, { recursive: true });
};

const makeStoredName = (originalName: string) => {
  const ext = path.extname(originalName);
  return `document-${Date.now()}-${crypto.randomUUID()}${ext}`;
};

export const uploadDocument = async ({ originalName, mimetype, size, buffer }: UploadInput): Promise<StoredDocument> => {
  const filename = makeStoredName(originalName);

  if (getProvider() === "supabase") {
    const { client, bucket } = getSupabase();

    const { error } = await client.storage.from(bucket).upload(
      filename,
      new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
      { contentType: mimetype, upsert: false },
    );

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    return {
      filename,
      path: filename,
      size,
      mimetype,
    };
  }

  await ensureUploadsDir();
  const localPath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(localPath, buffer);

  return {
    filename,
    path: localPath,
    size,
    mimetype,
  };
};

export const downloadDocument = async ({
  path: storedPath,
  originalName,
  mimetype,
  filename,
}: {
  path: string;
  originalName: string;
  mimetype: string;
  filename: string;
}): Promise<DownloadResult> => {
  if (getProvider() === "supabase") {
    const { client, bucket } = getSupabase();

    const { data, error } = await client.storage
      .from(bucket)
      .download(storedPath || filename);

    if (error) {
      throw error;
    }

    const arrayBuffer = await data.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    return {
      stream: Readable.from(fileBuffer),
      filename: originalName,
      mimetype: data.type || mimetype,
      size: fileBuffer.length,
    };
  }

  return {
    stream: fs.createReadStream(storedPath),
    filename: originalName,
    mimetype,
  };
};

export const deleteDocumentFile = async ({
  path: storedPath,
  filename,
}: {
  path: string;
  filename: string;
}) => {
  if (getProvider() === "supabase") {
    const { client, bucket } = getSupabase();

    const { error } = await client.storage
      .from(bucket)
      .remove([storedPath || filename]);

    if (error) {
      throw error;
    }
    return;
  }

  if (storedPath && fs.existsSync(storedPath)) {
    await fs.promises.unlink(storedPath);
  }
};
