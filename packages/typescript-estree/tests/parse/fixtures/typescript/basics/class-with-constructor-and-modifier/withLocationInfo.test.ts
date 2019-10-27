import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-constructor-and-modifier.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
