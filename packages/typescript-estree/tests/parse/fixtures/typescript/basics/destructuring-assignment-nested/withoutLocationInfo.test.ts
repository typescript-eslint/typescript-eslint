import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
