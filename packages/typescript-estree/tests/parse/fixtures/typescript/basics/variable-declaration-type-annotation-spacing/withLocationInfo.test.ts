import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/variable-declaration-type-annotation-spacing.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
