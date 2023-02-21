import MDXComponents from '@theme-original/MDXComponents';

import { RuleAttributes } from './RuleAttributes';
import { TryInPlayground } from './TryInPlayground';

// eslint-disable-next-line import/no-default-export
export default {
  ...MDXComponents,
  'rule-attributes': RuleAttributes,
  'try-in-playground': TryInPlayground,
};
