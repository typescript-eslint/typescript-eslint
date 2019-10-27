import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/arrow-function-with-optional-parameter.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
