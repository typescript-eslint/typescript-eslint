import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
