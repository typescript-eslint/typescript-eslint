import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/decorator-on-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
