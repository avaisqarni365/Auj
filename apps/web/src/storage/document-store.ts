// Object store seam (binary blobs) — implements the core-booking DocumentStore contract.
// Selection by env: S3/MinIO when OBJECT_STORE_* is set; durable Postgres bytea when only
// DATABASE_URL is set; in-memory otherwise. Product code depends only on this interface.
import { createPool, type DbPool } from '@auj/core-booking/postgres';

export interface StoredDoc {
  bytes: Uint8Array;
  contentType: string;
}

export interface ObjectStore {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<{ key: string }>;
  get(key: string): Promise<StoredDoc | undefined>;
  /** Backing implementation, for ops/health display. */
  readonly backend: 's3' | 'postgres' | 'memory';
}

class MemoryStore implements ObjectStore {
  readonly backend = 'memory' as const;
  private readonly m = new Map<string, StoredDoc>();
  async put(key: string, bytes: Uint8Array, contentType: string) {
    this.m.set(key, { bytes, contentType });
    return { key };
  }
  async get(key: string) {
    return this.m.get(key);
  }
}

class PostgresStore implements ObjectStore {
  readonly backend = 'postgres' as const;
  constructor(private readonly pool: DbPool) {}
  async put(key: string, bytes: Uint8Array, contentType: string) {
    await this.pool.query(
      `INSERT INTO documents_blob (key, content_type, bytes) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET content_type = $2, bytes = $3`,
      [key, contentType, Buffer.from(bytes)],
    );
    return { key };
  }
  async get(key: string) {
    const r = await this.pool.query<{ content_type: string; bytes: Buffer }>('SELECT content_type, bytes FROM documents_blob WHERE key = $1', [key]);
    const row = r.rows[0];
    return row ? { bytes: new Uint8Array(row.bytes), contentType: row.content_type } : undefined;
  }
}

class S3Store implements ObjectStore {
  readonly backend = 's3' as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly client: any, private readonly bucket: string, private readonly PutObjectCommand: any, private readonly GetObjectCommand: any) {}
  async put(key: string, bytes: Uint8Array, contentType: string) {
    await this.client.send(new this.PutObjectCommand({ Bucket: this.bucket, Key: key, Body: bytes, ContentType: contentType }));
    return { key };
  }
  async get(key: string) {
    try {
      const out = await this.client.send(new this.GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const bytes: Uint8Array = await out.Body.transformToByteArray();
      return { bytes, contentType: out.ContentType ?? 'application/octet-stream' };
    } catch {
      return undefined;
    }
  }
}

const KEY = Symbol.for('auj.storage.document.store');
const g = globalThis as unknown as { [KEY]?: Promise<ObjectStore> };

async function init(): Promise<ObjectStore> {
  const { OBJECT_STORE_ENDPOINT, OBJECT_STORE_KEY, OBJECT_STORE_SECRET, OBJECT_STORE_BUCKET, OBJECT_STORE_REGION, DATABASE_URL } = process.env;
  if (OBJECT_STORE_ENDPOINT && OBJECT_STORE_KEY && OBJECT_STORE_SECRET) {
    const { S3Client, PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      endpoint: OBJECT_STORE_ENDPOINT,
      region: OBJECT_STORE_REGION ?? 'us-east-1',
      forcePathStyle: true, // MinIO-compatible
      credentials: { accessKeyId: OBJECT_STORE_KEY, secretAccessKey: OBJECT_STORE_SECRET },
    });
    return new S3Store(client, OBJECT_STORE_BUCKET ?? 'auj', PutObjectCommand, GetObjectCommand);
  }
  if (DATABASE_URL) {
    const pool = createPool(DATABASE_URL);
    await pool.query('CREATE TABLE IF NOT EXISTS documents_blob (key text PRIMARY KEY, content_type text NOT NULL, bytes bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now())');
    return new PostgresStore(pool);
  }
  return new MemoryStore();
}

export function getObjectStore(): Promise<ObjectStore> {
  return (g[KEY] ??= init());
}
