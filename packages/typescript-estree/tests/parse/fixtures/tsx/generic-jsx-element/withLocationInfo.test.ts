import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/tsx/generic-jsx-element.src.tsx',
  ),
  {
    useJSXTextNode: false,
  },
);
