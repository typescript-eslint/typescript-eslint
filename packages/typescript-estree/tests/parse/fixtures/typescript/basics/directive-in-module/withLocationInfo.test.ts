import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/directive-in-module.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
