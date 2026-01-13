import { parseAndAnalyze } from '../test-utils';
import { getRealVariables } from '../test-utils/misc';

describe('references (script default: globals stay through)', () => {
  describe('When there is a `var` declaration on global (default)', () => {
    it('the reference on global should NOT be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('var a = 0;', {
        resolveGlobalVarsInScript: false,
      });

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');

      expect(reference.resolved).toBeNull();

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in functions should NOT be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(
        `
        var a = 0;
        function foo() {
          var b = a;
        }
      `,
        { resolveGlobalVarsInScript: false },
      );

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');

      expect(reference.resolved).toBeNull();

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });
});
