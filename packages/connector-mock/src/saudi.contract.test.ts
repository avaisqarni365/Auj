import { runSaudiConnectorContractTests } from '@auj/contracts/contract-tests';
import { MockSaudiConnector } from './saudi';

// The mock must satisfy the same contract the real connector-saudi will.
runSaudiConnectorContractTests('connector-mock', () => new MockSaudiConnector());
