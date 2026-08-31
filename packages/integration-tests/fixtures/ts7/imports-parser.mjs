try {
  await import('@typescript-eslint/parser');
} catch (error) {
  process.stderr.write(String(error));
}
