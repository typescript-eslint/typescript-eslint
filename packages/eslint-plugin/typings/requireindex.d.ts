declare module 'requireindex' {
  type RequireIndex = (
    path: string,
    basenames?: string[],
  ) => Record<string, any>;

  const fn: RequireIndex;
  export = fn;
}
