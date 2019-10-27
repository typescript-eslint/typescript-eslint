import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralComputedProperties/computed-getter-and-setter.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
