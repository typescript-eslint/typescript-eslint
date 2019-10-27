import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/typed-keyword-number.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
