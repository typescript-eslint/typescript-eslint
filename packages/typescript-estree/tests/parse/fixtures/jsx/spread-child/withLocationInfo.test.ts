import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/spread-child.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
