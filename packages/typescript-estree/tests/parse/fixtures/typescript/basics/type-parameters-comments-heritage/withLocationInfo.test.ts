import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/type-parameters-comments-heritage.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
