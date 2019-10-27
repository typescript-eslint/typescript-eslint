import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/var-with-definite-assignment.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
