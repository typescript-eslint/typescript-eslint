import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
