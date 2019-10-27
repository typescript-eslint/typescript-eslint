import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/error-numeric-param-multi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
