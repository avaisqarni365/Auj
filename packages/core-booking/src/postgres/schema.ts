// Inline DDL for the Postgres adapter. Idempotent (IF NOT EXISTS). Timestamps are
// stored as text because the domain uses ISO-8601 strings (lossless round-trip).
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pilgrims (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  nationality TEXT NOT NULL,
  residence_country TEXT,
  residence_permit BOOLEAN,
  dob TEXT NOT NULL,
  gender TEXT NOT NULL,
  mahram_pilgrim_id TEXT
);
CREATE INDEX IF NOT EXISTS pilgrims_customer_idx ON pilgrims (customer_id);

CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  items JSONB NOT NULL,
  totals JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  mode TEXT,
  status TEXT NOT NULL,
  pilgrim_ids JSONB NOT NULL,
  hold_id TEXT,
  hold_expires_at TEXT,
  booking_ref TEXT,
  visa_case_id TEXT,
  rawdah JSONB,
  gift JSONB,
  refund_amount INTEGER,
  refund_currency TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_items (
  booking_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  kind TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  net_amount INTEGER NOT NULL,
  net_currency TEXT NOT NULL,
  brn TEXT,
  PRIMARY KEY (booking_id, position)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  pilgrim_id TEXT NOT NULL,
  type TEXT NOT NULL,
  file_ref TEXT NOT NULL,
  verified BOOLEAN NOT NULL,
  uploaded_at TEXT NOT NULL,
  mrz TEXT
);
CREATE INDEX IF NOT EXISTS documents_pilgrim_idx ON documents (pilgrim_id);

CREATE TABLE IF NOT EXISTS visa_cases (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  visa_ref TEXT NOT NULL,
  route TEXT NOT NULL,
  status TEXT NOT NULL,
  per_pilgrim JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS document_blobs (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  bytes BYTEA NOT NULL
);
`;
