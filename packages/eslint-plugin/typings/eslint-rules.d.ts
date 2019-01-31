declare module 'eslint/lib/rules/*' {
  import RuleModule from 'ts-eslint';

  // intentionally redefined here instead of using Rule.RuleListener
  // because eslint only uses the `node => void` signature
  const rule: RuleModule<any[]>;
  export = rule;
}
