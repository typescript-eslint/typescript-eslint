import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/generators/yield-without-value-in-call.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
