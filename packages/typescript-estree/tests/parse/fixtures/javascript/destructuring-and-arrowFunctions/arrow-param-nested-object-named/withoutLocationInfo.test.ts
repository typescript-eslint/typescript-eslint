import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-arrowFunctions/arrow-param-nested-object-named.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
