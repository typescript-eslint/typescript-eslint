try {
  await import('@typescript-eslint/eslint-plugin');
} catch (error) {
  process.stderr.write(String(error));
}
