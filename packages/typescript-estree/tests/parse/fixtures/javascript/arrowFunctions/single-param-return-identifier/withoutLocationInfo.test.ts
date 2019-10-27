import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/single-param-return-identifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
