import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/restParams/func-expression-multi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
