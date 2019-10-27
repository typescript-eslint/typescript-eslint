import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/directives/function-non-strict.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
