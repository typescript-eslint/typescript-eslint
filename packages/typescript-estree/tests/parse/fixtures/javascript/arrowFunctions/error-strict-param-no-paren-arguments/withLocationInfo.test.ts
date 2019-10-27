import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/error-strict-param-no-paren-arguments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
