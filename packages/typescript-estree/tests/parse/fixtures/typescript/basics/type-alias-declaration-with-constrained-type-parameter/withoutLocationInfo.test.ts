import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
