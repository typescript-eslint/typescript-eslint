import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/generators/yield-without-value-no-semi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
