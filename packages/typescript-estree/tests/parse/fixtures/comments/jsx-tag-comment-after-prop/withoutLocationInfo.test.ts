import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-tag-comment-after-prop.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
