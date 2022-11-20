import remarkPresetLintConsistent from 'remark-preset-lint-consistent';
import remarkPresetLintRecommended from 'remark-preset-lint-recommended';

export default {
  plugins: [
    'remark-lint',
    remarkPresetLintConsistent,
    remarkPresetLintRecommended,
  ],
};
