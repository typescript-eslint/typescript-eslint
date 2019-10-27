import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
