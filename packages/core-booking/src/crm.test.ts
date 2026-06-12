import { describe, it, expect } from 'vitest';
import { CrmService } from './crm';
import { createInMemoryStores } from './in-memory';

function makeCrm() {
  const stores = createInMemoryStores();
  return new CrmService(stores.customers, stores.pilgrims, () => '2026-06-12T00:00:00.000Z');
}

describe('CrmService', () => {
  it('creates customers and pilgrims', async () => {
    const crm = makeCrm();
    const customer = await crm.createCustomer({ fullName: 'Imran Ali', email: 'imran@example.com' });
    expect(customer.id).toBeTruthy();
    const p = await crm.addPilgrim({
      customerId: customer.id, firstName: 'Imran', lastName: 'Ali',
      passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M',
    });
    expect(p.customerId).toBe(customer.id);
  });

  it('rejects pilgrims for unknown customers', async () => {
    const crm = makeCrm();
    await expect(
      crm.addPilgrim({ customerId: 'nope', firstName: 'X', lastName: 'Y', passportNumber: 'P', nationality: 'PK', dob: '1990-01-01', gender: 'M' }),
    ).rejects.toThrow(/Unknown customer/);
  });

  it('links a mahram within the same customer and rejects cross-customer links', async () => {
    const crm = makeCrm();
    const c1 = await crm.createCustomer({ fullName: 'Family One', email: 'one@example.com' });
    const father = await crm.addPilgrim({ customerId: c1.id, firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1980-01-01', gender: 'M' });
    const child = await crm.addPilgrim({ customerId: c1.id, firstName: 'Sara', lastName: 'Ali', passportNumber: 'PK2', nationality: 'PK', dob: '2010-01-01', gender: 'F' });
    const linked = await crm.linkMahram(child.id, father.id);
    expect(linked.mahramPilgrimId).toBe(father.id);

    const c2 = await crm.createCustomer({ fullName: 'Family Two', email: 'two@example.com' });
    const stranger = await crm.addPilgrim({ customerId: c2.id, firstName: 'Z', lastName: 'Q', passportNumber: 'PK3', nationality: 'PK', dob: '1980-01-01', gender: 'M' });
    await expect(crm.linkMahram(child.id, stranger.id)).rejects.toThrow(/same customer/);
  });
});
