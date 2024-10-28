declare module 'errors' {
  class ErrorLike {}

  export function createError(): ErrorLike;
}
