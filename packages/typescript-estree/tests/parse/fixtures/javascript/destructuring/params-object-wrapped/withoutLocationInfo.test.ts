import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/params-object-wrapped.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
