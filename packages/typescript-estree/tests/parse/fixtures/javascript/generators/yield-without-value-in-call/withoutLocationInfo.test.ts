import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
