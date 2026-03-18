import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
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
const provider = process.env.STORAGE_PROVIDER?.toLowerCase() || "local";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET;

const hasSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  supabaseBucket
);

const supabase =
  provider === "supabase" && hasSupabaseConfig
    ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

const ensureUploadsDir = async () => {
  await fs.promises.mkdir(uploadsDir, { recursive: true });
};

const makeStoredName = (originalName: string) => {
  const ext = path.extname(originalName);
  return `document-${Date.now()}-${crypto.randomUUID()}${ext}`;
};

export const uploadDocument = async ({ originalName, mimetype, size, buffer }: UploadInput): Promise<StoredDocument> => {
  const filename = makeStoredName(originalName);

  if (provider === "supabase") {
    if (!supabase || !supabaseBucket) {
      throw new Error("Supabase storage is not fully configured");
    }

    const { error } = await supabase.storage.from(supabaseBucket).upload(filename, buffer, {
      contentType: mimetype,
      upsert: false,
    });

    if (error) {
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
  if (provider === "supabase") {
    if (!supabase || !supabaseBucket) {
      throw new Error("Supabase storage is not fully configured");
    }

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
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
  if (provider === "supabase") {
    if (!supabase || !supabaseBucket) {
      throw new Error("Supabase storage is not fully configured");
    }

    const { error } = await supabase.storage
      .from(supabaseBucket)
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
