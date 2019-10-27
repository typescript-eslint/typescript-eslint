import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
