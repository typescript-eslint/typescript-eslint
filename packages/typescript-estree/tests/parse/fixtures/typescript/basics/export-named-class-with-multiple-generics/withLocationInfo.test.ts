import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/export-named-class-with-multiple-generics.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
