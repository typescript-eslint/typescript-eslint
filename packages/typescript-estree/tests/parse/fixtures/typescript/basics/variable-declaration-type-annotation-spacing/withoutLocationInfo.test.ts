import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
