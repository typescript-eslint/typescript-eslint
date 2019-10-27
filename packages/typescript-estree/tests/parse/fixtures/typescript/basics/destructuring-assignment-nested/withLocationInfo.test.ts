import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/destructuring-assignment-nested.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
