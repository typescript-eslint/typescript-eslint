import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/type-alias-declaration-with-constrained-type-parameter.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
