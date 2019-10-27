import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-index-signature-private.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
