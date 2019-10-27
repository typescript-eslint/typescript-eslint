import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/declare/abstract-class.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
