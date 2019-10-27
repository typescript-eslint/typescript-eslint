import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
