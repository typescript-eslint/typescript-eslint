import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/declare/variable.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
