import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/restParams/invalid-rest-param.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
