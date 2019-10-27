import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
