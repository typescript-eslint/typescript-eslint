import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
