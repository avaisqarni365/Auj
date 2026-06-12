import { runTravelSupplierContractTests } from '@auj/contracts/contract-tests';
import { MockTravelSupplier } from './travel';

runTravelSupplierContractTests('connector-mock', () => new MockTravelSupplier());
