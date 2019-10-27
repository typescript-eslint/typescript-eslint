import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/await-without-async-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
