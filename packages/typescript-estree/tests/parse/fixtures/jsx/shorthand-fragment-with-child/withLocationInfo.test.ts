import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/shorthand-fragment-with-child.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
