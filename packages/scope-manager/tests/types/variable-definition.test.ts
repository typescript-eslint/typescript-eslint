import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { getSpecificNode, parseAndAnalyze } from '../util';

describe('variable definition', () => {
  it('defines a variable for a type declaration', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl = string;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSTypeAliasDeclaration);
    expect(scopeManager.getDeclaredVariables(node)).toMatchInlineSnapshot(`
      Array [
        Variable$1 {
          defs: Array [
            TypeDefinition$1 {
              name: Identifier<"TypeDecl">,
              node: TSTypeAliasDeclaration$1,
            },
          ],
          name: "TypeDecl",
          references: Array [],
          isValueVariable: false,
          isTypeVariable: true,
        },
      ]
    `);
  });

  it('defines a variable for an interface definition', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      interface InterfaceDecl {
        prop: string;
      }
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSInterfaceDeclaration);
    expect(scopeManager.getDeclaredVariables(node)).toMatchInlineSnapshot(`
      Array [
        Variable$1 {
          defs: Array [
            TypeDefinition$1 {
              name: Identifier<"InterfaceDecl">,
              node: TSInterfaceDeclaration$1,
            },
          ],
          name: "InterfaceDecl",
          references: Array [],
          isValueVariable: false,
          isTypeVariable: true,
        },
      ]
    `);
  });

  it('defines a variable for a generic type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = string;
    `);
    const node = getSpecificNode(ast, AST_NODE_TYPES.TSTypeParameter);
    expect(scopeManager.getDeclaredVariables(node)).toMatchInlineSnapshot(`
      Array [
        Variable$2 {
          defs: Array [
            TypeDefinition$2 {
              name: Identifier<"TypeParam">,
              node: TSTypeParameter$1,
            },
          ],
          name: "TypeParam",
          references: Array [],
          isValueVariable: false,
          isTypeVariable: true,
        },
      ]
    `);
  });

  it('defines a variable for an inferred generic type', () => {
    const { ast, scopeManager } = parseAndAnalyze(`
      type TypeDecl<TypeParam> = TypeParam extends Foo<infer Inferred> ? Inferred : never;
    `);
    const node = getSpecificNode(
      ast,
      AST_NODE_TYPES.TSInferType,
      n => n.typeParameter,
    );
    expect(scopeManager.getDeclaredVariables(node)).toMatchInlineSnapshot(`
      Array [
        Variable$3 {
          defs: Array [
            TypeDefinition$3 {
              name: Identifier<"Inferred">,
              node: TSTypeParameter$1,
            },
          ],
          name: "Inferred",
          references: Array [
            Reference$3 {
              identifier: Identifier<"Inferred">,
              isTypeReference: true,
              isValueReference: false,
              resolved: Variable$3,
            },
          ],
          isValueVariable: false,
          isTypeVariable: true,
        },
      ]
    `);
  });
});
