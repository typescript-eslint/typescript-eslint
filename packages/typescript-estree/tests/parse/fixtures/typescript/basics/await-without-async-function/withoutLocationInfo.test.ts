import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
