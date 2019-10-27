import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/parenthesized-type.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
