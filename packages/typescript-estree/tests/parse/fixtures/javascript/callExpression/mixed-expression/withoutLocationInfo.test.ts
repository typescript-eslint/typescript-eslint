import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/callExpression/mixed-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
