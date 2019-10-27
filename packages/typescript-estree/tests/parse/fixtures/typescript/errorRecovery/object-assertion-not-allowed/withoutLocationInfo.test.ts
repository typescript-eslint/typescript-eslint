import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/object-assertion-not-allowed.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
