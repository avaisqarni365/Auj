import { runSaudiConnectorContractTests } from '@auj/contracts/contract-tests';
import { createSaudiConnector } from './index';

// The certified connector must satisfy the SAME contract as the mock (drop-in).
runSaudiConnectorContractTests('connector-saudi (sandbox)', () => createSaudiConnector());
