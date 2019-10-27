import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/import-equal-declaration.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
