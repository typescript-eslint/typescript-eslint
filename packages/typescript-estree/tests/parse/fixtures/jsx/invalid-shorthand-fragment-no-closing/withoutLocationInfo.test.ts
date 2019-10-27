import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-shorthand-fragment-no-closing.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
