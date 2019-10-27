import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/generators/double-yield.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
