// Inline DDL for the support Postgres adapter. Idempotent. Messages are a jsonb array.
export const SUPPORT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ref TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  booking_ref TEXT,
  messages JSONB NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tickets_user_idx ON tickets (user_id);
`;
