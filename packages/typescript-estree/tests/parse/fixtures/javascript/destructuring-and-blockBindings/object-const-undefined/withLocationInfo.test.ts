import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-blockBindings/object-const-undefined.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
