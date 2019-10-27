import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
