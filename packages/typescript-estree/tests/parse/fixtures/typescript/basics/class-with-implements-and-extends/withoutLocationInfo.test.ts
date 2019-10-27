import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
