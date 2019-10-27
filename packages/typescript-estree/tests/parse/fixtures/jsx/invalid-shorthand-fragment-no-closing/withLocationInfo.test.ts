import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
