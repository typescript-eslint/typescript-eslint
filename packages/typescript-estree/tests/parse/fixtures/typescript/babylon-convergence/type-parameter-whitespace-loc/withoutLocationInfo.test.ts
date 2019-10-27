import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/babylon-convergence/type-parameter-whitespace-loc.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
