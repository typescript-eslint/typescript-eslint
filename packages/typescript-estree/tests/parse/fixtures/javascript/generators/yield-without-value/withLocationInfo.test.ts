import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/generators/yield-without-value.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
