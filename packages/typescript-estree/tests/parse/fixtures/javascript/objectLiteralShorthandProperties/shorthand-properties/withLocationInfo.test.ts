import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralShorthandProperties/shorthand-properties.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
