try {
  await import('typescript-eslint');
} catch (error) {
  process.stderr.write(String(error));
}
