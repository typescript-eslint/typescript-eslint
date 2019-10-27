import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/restParams/single-rest.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
