import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/angle-bracket-type-assertion-arrow-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
