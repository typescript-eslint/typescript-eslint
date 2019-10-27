import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
