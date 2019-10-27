import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/directives/non-directive-string.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
