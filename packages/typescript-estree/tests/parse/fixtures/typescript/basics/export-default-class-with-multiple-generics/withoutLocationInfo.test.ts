import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/export-default-class-with-multiple-generics.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
