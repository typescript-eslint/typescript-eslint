import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/enum-with-keywords.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
