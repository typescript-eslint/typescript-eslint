import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/type-assertion-in-arrow-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
