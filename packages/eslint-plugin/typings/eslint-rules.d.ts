// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' {
//   import RuleModule from 'ts-eslint';
//   const rule: RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/lib/rules/camelcase' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    'notCamelCase',
    [
      {
        ignoreDestructuring?: boolean;
        properties?: 'always' | 'never';
        allow?: string[];
      }
    ],
    {
      Identifier: (node: TSESTree.Node) => void;
    }
  >;
  export = rule;
}
