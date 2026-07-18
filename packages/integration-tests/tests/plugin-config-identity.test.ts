import { nodeIntegrationTest } from '../tools/integration-test-base';

nodeIntegrationTest(__filename, 'index.mjs', stderr => {
  expect(stderr).toBe('');
});
import { nodeIntegrationTest } from '../tools/integration-test-base';

nodeIntegrationTest(__filename, 'index.mjs');
