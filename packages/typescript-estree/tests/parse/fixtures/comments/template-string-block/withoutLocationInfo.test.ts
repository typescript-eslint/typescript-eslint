import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
