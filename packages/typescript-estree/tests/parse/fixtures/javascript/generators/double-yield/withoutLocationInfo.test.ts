import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
