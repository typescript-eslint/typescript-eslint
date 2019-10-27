import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/not-strict-octal.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
