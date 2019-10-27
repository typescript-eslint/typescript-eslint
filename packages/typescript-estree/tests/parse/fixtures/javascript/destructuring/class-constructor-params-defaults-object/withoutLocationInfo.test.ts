import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/class-constructor-params-defaults-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
