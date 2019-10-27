import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-index-signature-export.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
