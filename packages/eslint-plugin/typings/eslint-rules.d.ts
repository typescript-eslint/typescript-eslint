declare module 'eslint/lib/rules/*' {
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<any[], any>;
  export = rule;
}

declare module 'eslint/lib/rules/camelcase' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    [
      {
        ignoreDestructuring: boolean;
        properties: 'always' | 'never';
        allow: string[];
      }
    ],
    'notCamelCase',
    {
      Identifier: (node: TSESTree.Node) => void;
    }
  >;
  export = rule;
}
