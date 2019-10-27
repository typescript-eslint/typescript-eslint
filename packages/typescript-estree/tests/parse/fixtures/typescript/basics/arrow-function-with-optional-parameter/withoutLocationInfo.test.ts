import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
