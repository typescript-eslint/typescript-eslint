import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/directives/directive-in-class.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
