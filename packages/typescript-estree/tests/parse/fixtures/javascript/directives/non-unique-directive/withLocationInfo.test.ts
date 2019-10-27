import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/directives/non-unique-directive.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
