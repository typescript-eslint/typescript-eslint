export function debounce<X extends unknown[]>(
  func: (...args: X) => void,
  wait,
): (...args: X) => void {
  let timeout;
  return function (...args: X): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.call(null, ...args);
    }, wait);
  };
}
