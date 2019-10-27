import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/directives/program-order.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
