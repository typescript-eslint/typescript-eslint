import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/embedded-conditional.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
