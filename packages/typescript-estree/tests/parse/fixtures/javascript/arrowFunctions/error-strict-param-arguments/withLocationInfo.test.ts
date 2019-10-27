import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/error-strict-param-arguments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
