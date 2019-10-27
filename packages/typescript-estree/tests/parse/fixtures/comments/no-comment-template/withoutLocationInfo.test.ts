import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/no-comment-template.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
