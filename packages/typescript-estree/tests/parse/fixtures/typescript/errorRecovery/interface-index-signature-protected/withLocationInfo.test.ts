import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-index-signature-protected.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
