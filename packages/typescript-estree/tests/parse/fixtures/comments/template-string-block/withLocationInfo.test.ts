import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/template-string-block.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
