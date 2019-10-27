import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/async-function-with-var-declaration.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
