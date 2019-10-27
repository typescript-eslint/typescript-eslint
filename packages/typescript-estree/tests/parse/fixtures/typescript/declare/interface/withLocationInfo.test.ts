import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/declare/interface.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
