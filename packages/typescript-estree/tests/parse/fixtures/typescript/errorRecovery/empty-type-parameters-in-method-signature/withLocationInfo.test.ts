import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/empty-type-parameters-in-method-signature.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
