import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/arrowFunctions/block-body-not-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
