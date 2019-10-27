import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/restParams/error-no-default.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
