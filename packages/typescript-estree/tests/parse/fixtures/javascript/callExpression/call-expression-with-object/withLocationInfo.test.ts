import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/callExpression/call-expression-with-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
