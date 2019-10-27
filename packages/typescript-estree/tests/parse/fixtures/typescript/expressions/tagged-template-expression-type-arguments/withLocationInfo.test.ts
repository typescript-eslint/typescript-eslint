import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/expressions/tagged-template-expression-type-arguments.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
