import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/export-named-class-with-generic.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
