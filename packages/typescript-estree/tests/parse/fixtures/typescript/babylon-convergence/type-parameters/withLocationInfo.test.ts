import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/babylon-convergence/type-parameters.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
