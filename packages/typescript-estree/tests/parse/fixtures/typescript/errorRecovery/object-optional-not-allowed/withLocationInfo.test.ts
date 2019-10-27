import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/object-optional-not-allowed.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
