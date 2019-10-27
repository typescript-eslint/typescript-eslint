import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
