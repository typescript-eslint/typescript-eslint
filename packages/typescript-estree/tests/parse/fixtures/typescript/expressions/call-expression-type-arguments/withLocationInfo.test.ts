import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/expressions/call-expression-type-arguments.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
