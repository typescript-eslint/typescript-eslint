import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-leading-dot-tag-name.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
