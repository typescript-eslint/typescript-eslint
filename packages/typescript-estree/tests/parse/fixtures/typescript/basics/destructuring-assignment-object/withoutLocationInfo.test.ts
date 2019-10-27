import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/destructuring-assignment-object.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
