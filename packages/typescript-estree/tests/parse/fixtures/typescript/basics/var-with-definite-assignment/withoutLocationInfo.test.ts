import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
