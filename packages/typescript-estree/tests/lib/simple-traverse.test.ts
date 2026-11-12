import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { parse } from '../../src/parser';
import { simpleTraverse } from '../../src/simple-traverse';

describe(simpleTraverse, () => {
  const code = 'const foo = bar;';

  it('sets parent pointers when setParentPointers is true', () => {
    const ast = parse(code);

    simpleTraverse(ast, { visitors: {} }, true);

    const [declaration] = ast.body;
    assert(declaration.type === AST_NODE_TYPES.VariableDeclaration);
    const [declarator] = declaration.declarations;

    expect(ast.parent).toBeUndefined();
    expect(declaration.parent).toBe(ast);
    expect(declarator.parent).toBe(declaration);
    expect(declarator.id.parent).toBe(declarator);
    expect(declarator.init?.parent).toBe(declarator);
  });

  it('does not set parent pointers by default', () => {
    const ast = parse(code);

    simpleTraverse(ast, { visitors: {} });

    const [declaration] = ast.body;

    expect(ast).not.toHaveProperty('parent');
    expect(declaration).not.toHaveProperty('parent');
  });
});
