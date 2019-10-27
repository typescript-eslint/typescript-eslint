import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-multi-line-keyword-abstract.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
