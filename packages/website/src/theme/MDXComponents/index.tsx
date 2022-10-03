import MDXComponents from '@theme-original/MDXComponents';

import { ConfigurationContents } from './ConfigurationContents';
import { RuleAttributes } from './RuleAttributes';

// eslint-disable-next-line import/no-default-export
export default {
  ...MDXComponents,
  'configuration-contents': ConfigurationContents,
  'rule-attributes': RuleAttributes,
};
