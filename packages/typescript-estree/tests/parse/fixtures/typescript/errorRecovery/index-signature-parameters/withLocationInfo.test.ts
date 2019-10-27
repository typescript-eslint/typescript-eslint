import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/index-signature-parameters.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
