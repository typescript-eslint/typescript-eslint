import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/export-default-class-with-generic.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
