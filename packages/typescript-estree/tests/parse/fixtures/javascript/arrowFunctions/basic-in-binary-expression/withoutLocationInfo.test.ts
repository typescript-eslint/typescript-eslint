import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/basic-in-binary-expression.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
