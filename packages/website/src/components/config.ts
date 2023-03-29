export const detailTabs = [
  { value: false as const, label: 'Errors' },
  { value: 'es' as const, label: 'ESTree' },
  { value: 'ts' as const, label: 'TypeScript' },
  { value: 'scope' as const, label: 'Scope' },
];

export const fileTypes = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'd.ts',
  'cjs',
  'mjs',
  'cts',
  'mts',
] as const;
