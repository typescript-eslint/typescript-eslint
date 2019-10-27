import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/tag-names-with-dots.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
