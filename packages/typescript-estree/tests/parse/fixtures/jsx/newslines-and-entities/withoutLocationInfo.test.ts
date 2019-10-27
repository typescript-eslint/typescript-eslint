import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/newslines-and-entities.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
