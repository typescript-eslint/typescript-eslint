import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-implements-and-extends.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
