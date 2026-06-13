import type pg from 'pg';
import type { Booking, CrmPilgrim, Customer, Document, Package, VisaCase } from '../domain';
import type {
  BookingRepository,
  CustomerRepository,
  DocumentRepository,
  DocumentStore,
  PackageRepository,
  PilgrimRepository,
  VisaCaseRepository,
} from '../ports';
import type { Stores } from '../in-memory';
import {
  rowToBooking,
  rowToCustomer,
  rowToDocument,
  rowToPackage,
  rowToPilgrim,
  rowToVisaCase,
  type BookingItemRow,
  type BookingRow,
  type CustomerRow,
  type DocumentRow,
  type PackageRow,
  type PilgrimRow,
  type VisaCaseRow,
} from './mappers';

class PgCustomerRepository implements CustomerRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<Customer | undefined> {
    const { rows } = await this.pool.query<CustomerRow>('SELECT * FROM customers WHERE id = $1', [id]);
    return rows[0] ? rowToCustomer(rows[0]) : undefined;
  }
  async save(c: Customer): Promise<Customer> {
    await this.pool.query(
      `INSERT INTO customers (id, full_name, email, phone, created_at) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET full_name=$2, email=$3, phone=$4`,
      [c.id, c.fullName, c.email, c.phone ?? null, c.createdAt],
    );
    return c;
  }
  async list(): Promise<Customer[]> {
    const { rows } = await this.pool.query<CustomerRow>('SELECT * FROM customers');
    return rows.map(rowToCustomer);
  }
}

class PgPilgrimRepository implements PilgrimRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<CrmPilgrim | undefined> {
    const { rows } = await this.pool.query<PilgrimRow>('SELECT * FROM pilgrims WHERE id = $1', [id]);
    return rows[0] ? rowToPilgrim(rows[0]) : undefined;
  }
  async save(p: CrmPilgrim): Promise<CrmPilgrim> {
    await this.pool.query(
      `INSERT INTO pilgrims (id, customer_id, first_name, last_name, passport_number, nationality, residence_country, residence_permit, dob, gender, mahram_pilgrim_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET customer_id=$2, first_name=$3, last_name=$4, passport_number=$5, nationality=$6, residence_country=$7, residence_permit=$8, dob=$9, gender=$10, mahram_pilgrim_id=$11`,
      [p.id, p.customerId, p.firstName, p.lastName, p.passportNumber, p.nationality, p.residenceCountry ?? null, p.residencePermit ?? null, p.dob, p.gender, p.mahramPilgrimId ?? null],
    );
    return p;
  }
  async list(): Promise<CrmPilgrim[]> {
    const { rows } = await this.pool.query<PilgrimRow>('SELECT * FROM pilgrims');
    return rows.map(rowToPilgrim);
  }
}

class PgPackageRepository implements PackageRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<Package | undefined> {
    const { rows } = await this.pool.query<PackageRow>('SELECT * FROM packages WHERE id = $1', [id]);
    return rows[0] ? rowToPackage(rows[0]) : undefined;
  }
  async save(p: Package): Promise<Package> {
    await this.pool.query(
      `INSERT INTO packages (id, name, channel, items, totals) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb)
       ON CONFLICT (id) DO UPDATE SET name=$2, channel=$3, items=$4::jsonb, totals=$5::jsonb`,
      [p.id, p.name, p.channel, JSON.stringify(p.items), JSON.stringify(p.totals)],
    );
    return p;
  }
  async list(): Promise<Package[]> {
    const { rows } = await this.pool.query<PackageRow>('SELECT * FROM packages');
    return rows.map(rowToPackage);
  }
}

class PgBookingRepository implements BookingRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<Booking | undefined> {
    const { rows } = await this.pool.query<BookingRow>('SELECT * FROM bookings WHERE id = $1', [id]);
    const head = rows[0];
    if (!head) return undefined;
    const items = await this.pool.query<BookingItemRow>('SELECT * FROM booking_items WHERE booking_id = $1', [id]);
    return rowToBooking(head, items.rows);
  }
  async save(b: Booking): Promise<Booking> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO bookings (id, customer_id, channel, status, pilgrim_ids, hold_id, hold_expires_at, booking_ref, visa_case_id, refund_amount, refund_currency, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO UPDATE SET customer_id=$2, channel=$3, status=$4, pilgrim_ids=$5::jsonb, hold_id=$6, hold_expires_at=$7, booking_ref=$8, visa_case_id=$9, refund_amount=$10, refund_currency=$11, updated_at=$13`,
        [b.id, b.customerId, b.channel, b.status, JSON.stringify(b.pilgrimIds), b.holdId ?? null, b.holdExpiresAt ?? null, b.bookingRef ?? null, b.visaCaseId ?? null, b.refund?.amount ?? null, b.refund?.currency ?? null, b.createdAt, b.updatedAt],
      );
      await client.query('DELETE FROM booking_items WHERE booking_id = $1', [b.id]);
      for (let i = 0; i < b.items.length; i += 1) {
        const it = b.items[i]!;
        await client.query(
          `INSERT INTO booking_items (booking_id, position, kind, offer_id, title, net_amount, net_currency, brn)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [b.id, i, it.kind, it.offerId, it.title, it.net.amount, it.net.currency, it.brn ?? null],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return b;
  }
  async list(): Promise<Booking[]> {
    const { rows } = await this.pool.query<BookingRow>('SELECT * FROM bookings');
    const out: Booking[] = [];
    for (const head of rows) {
      const items = await this.pool.query<BookingItemRow>('SELECT * FROM booking_items WHERE booking_id = $1', [head.id]);
      out.push(rowToBooking(head, items.rows));
    }
    return out;
  }
}

class PgVisaCaseRepository implements VisaCaseRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<VisaCase | undefined> {
    const { rows } = await this.pool.query<VisaCaseRow>('SELECT * FROM visa_cases WHERE id = $1', [id]);
    return rows[0] ? rowToVisaCase(rows[0]) : undefined;
  }
  async save(v: VisaCase): Promise<VisaCase> {
    await this.pool.query(
      `INSERT INTO visa_cases (id, booking_id, visa_ref, route, status, per_pilgrim) VALUES ($1,$2,$3,$4,$5,$6::jsonb)
       ON CONFLICT (id) DO UPDATE SET booking_id=$2, visa_ref=$3, route=$4, status=$5, per_pilgrim=$6::jsonb`,
      [v.id, v.bookingId, v.visaRef, v.route, v.status, JSON.stringify(v.perPilgrim)],
    );
    return v;
  }
  async list(): Promise<VisaCase[]> {
    const { rows } = await this.pool.query<VisaCaseRow>('SELECT * FROM visa_cases');
    return rows.map(rowToVisaCase);
  }
}

class PgDocumentRepository implements DocumentRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(id: string): Promise<Document | undefined> {
    const { rows } = await this.pool.query<DocumentRow>('SELECT * FROM documents WHERE id = $1', [id]);
    return rows[0] ? rowToDocument(rows[0]) : undefined;
  }
  async save(d: Document): Promise<Document> {
    await this.pool.query(
      `INSERT INTO documents (id, pilgrim_id, type, file_ref, verified, uploaded_at, mrz) VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET pilgrim_id=$2, type=$3, file_ref=$4, verified=$5, uploaded_at=$6, mrz=$7`,
      [d.id, d.pilgrimId, d.type, d.fileRef, d.verified, d.uploadedAt, d.mrz ?? null],
    );
    return d;
  }
  async list(): Promise<Document[]> {
    const { rows } = await this.pool.query<DocumentRow>('SELECT * FROM documents');
    return rows.map(rowToDocument);
  }
  async listByPilgrim(pilgrimId: string): Promise<Document[]> {
    const { rows } = await this.pool.query<DocumentRow>('SELECT * FROM documents WHERE pilgrim_id = $1', [pilgrimId]);
    return rows.map(rowToDocument);
  }
}

class PgDocumentStore implements DocumentStore {
  constructor(private readonly pool: pg.Pool) {}
  async put(key: string, bytes: Uint8Array, contentType: string): Promise<{ key: string }> {
    await this.pool.query(
      `INSERT INTO document_blobs (key, content_type, bytes) VALUES ($1,$2,$3)
       ON CONFLICT (key) DO UPDATE SET content_type=$2, bytes=$3`,
      [key, contentType, Buffer.from(bytes)],
    );
    return { key };
  }
  async get(key: string): Promise<Uint8Array | undefined> {
    const { rows } = await this.pool.query<{ bytes: Buffer }>('SELECT bytes FROM document_blobs WHERE key = $1', [key]);
    return rows[0] ? new Uint8Array(rows[0].bytes) : undefined;
  }
}

/** Postgres-backed Stores — a drop-in for createCoreBooking({ stores }). */
export function createPostgresStores(pool: pg.Pool): Stores {
  return {
    customers: new PgCustomerRepository(pool),
    pilgrims: new PgPilgrimRepository(pool),
    packages: new PgPackageRepository(pool),
    bookings: new PgBookingRepository(pool),
    visaCases: new PgVisaCaseRepository(pool),
    documents: new PgDocumentRepository(pool),
    documentStore: new PgDocumentStore(pool),
  };
}
