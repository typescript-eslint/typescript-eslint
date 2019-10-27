import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
