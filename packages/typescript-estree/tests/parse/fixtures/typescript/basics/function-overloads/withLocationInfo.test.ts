import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/function-overloads.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
