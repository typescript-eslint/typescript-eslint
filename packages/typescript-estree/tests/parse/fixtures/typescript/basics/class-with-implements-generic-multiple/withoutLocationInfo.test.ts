import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-implements-generic-multiple.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
