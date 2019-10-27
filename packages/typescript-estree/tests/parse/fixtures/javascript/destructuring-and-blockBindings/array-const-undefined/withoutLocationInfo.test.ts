import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-blockBindings/array-const-undefined.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
