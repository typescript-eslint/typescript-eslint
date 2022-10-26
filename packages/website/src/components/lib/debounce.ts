export function debounce<X extends unknown[]>(
  func: (...args: X) => void,
  wait: number,
): (...args: X) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeout: any | undefined;
  return function (...args: X): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      func.call(null, ...args);
    }, wait);
  };
}
