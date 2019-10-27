import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-extends-generic-multiple.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
