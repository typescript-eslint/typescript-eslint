import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/embedded-tags.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
