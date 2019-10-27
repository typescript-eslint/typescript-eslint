import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/declare/enum.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
