import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/basics/identifiers-double-underscore.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
