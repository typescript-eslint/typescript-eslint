import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/empty-type-parameters-in-constructor.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
