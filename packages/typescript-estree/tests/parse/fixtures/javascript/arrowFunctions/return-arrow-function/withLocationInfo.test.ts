import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/return-arrow-function.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
