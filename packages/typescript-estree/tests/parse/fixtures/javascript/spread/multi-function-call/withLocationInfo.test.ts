import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/spread/multi-function-call.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
