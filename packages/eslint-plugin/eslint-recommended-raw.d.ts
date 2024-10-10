declare const config: (style: 'glob' | 'minimatch') => {
  files: string[];
  rules: Record<string, 'off' | 'warn' | 'error'>;
};
export = config;
