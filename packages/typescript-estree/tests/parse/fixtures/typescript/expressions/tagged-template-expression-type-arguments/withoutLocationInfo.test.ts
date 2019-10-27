import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
