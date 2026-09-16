import type { StringLiteral } from '../src/expression/literal/StringLiteral/spec';
import type { ImportAttribute } from '../src/special/ImportAttribute/spec';

test('ImportAttribute value is narrowed to a string literal', () => {
  // Import attributes only permit string-literal values per the spec, so the
  // AST type must be narrowed from the generic `Literal` to `StringLiteral`.
  expectTypeOf<ImportAttribute['value']>().toEqualTypeOf<StringLiteral>();
});
