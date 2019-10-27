import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/empty-type-arguments-in-new-expression.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
