import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/embedded-invalid-js-identifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
