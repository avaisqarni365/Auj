import type { CrmPilgrim, Customer } from './domain';
import type { Clock, CustomerRepository, PilgrimRepository } from './ports';
import { uuidv7 } from './ids';

const isoNow: Clock = () => new Date().toISOString();

/** Customer + pilgrim CRM, including mahram (guardian) linking. */
export class CrmService {
  constructor(
    private readonly customers: CustomerRepository,
    private readonly pilgrims: PilgrimRepository,
    private readonly now: Clock = isoNow,
  ) {}

  async createCustomer(input: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return this.customers.save({ ...input, id: uuidv7(), createdAt: this.now() });
  }

  async addPilgrim(input: Omit<CrmPilgrim, 'id'>): Promise<CrmPilgrim> {
    const customer = await this.customers.get(input.customerId);
    if (!customer) throw new Error(`Unknown customer: ${input.customerId}`);
    return this.pilgrims.save({ ...input, id: uuidv7() });
  }

  /** Link a mahram (guardian). Both pilgrims must exist and belong to the same customer. */
  async linkMahram(pilgrimId: string, mahramPilgrimId: string): Promise<CrmPilgrim> {
    const pilgrim = await this.pilgrims.get(pilgrimId);
    const mahram = await this.pilgrims.get(mahramPilgrimId);
    if (!pilgrim) throw new Error(`Unknown pilgrim: ${pilgrimId}`);
    if (!mahram) throw new Error(`Unknown mahram: ${mahramPilgrimId}`);
    if (pilgrim.customerId !== mahram.customerId) {
      throw new Error('Mahram must belong to the same customer');
    }
    return this.pilgrims.save({ ...pilgrim, mahramPilgrimId });
  }

  async getPilgrims(ids: string[]): Promise<CrmPilgrim[]> {
    const found = await Promise.all(ids.map((id) => this.pilgrims.get(id)));
    return found.filter((p): p is CrmPilgrim => p !== undefined);
  }
}
