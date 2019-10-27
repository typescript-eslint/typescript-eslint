import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/empty-literal-derived-class.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
