import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/multiple-blank-spaces.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
