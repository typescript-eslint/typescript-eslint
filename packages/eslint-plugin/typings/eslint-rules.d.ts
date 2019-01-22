declare module 'eslint/lib/rules/*' {
  import { Node } from 'estree';
  import { Rule } from 'eslint';

  // intentionally redefined here instead of using Rule.RuleListener
  // because eslint only uses the `node => void` signature
  const rule: {
    create(context: Rule.RuleContext): Record<string, (node: Node) => void>;
    meta: Rule.RuleMetaData;
  };
  export = rule;
}
