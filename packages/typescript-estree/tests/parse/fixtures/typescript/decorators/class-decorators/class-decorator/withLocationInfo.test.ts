import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/class-decorators/class-decorator.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
