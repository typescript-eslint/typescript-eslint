import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/angle-bracket-type-assertion.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
