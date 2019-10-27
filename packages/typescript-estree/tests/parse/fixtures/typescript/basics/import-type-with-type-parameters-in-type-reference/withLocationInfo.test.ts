import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/import-type-with-type-parameters-in-type-reference.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
