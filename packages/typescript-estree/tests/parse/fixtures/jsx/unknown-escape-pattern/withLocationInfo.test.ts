import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/unknown-escape-pattern.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
