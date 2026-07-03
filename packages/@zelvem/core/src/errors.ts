/**
 * Application-level error carried inside neverthrow `Result` values.
 * Business failures are represented as values and resolved by callers;
 * only unexpected/unrecoverable errors are thrown as exceptions.
 */
export class AppError extends Error {
  /**
   * @param code - Stable machine-readable error code, e.g. `USER_NOT_FOUND`
   * @param message - Optional human-readable detail; defaults to the code
   */
  constructor(
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code)
    this.name = 'AppError'
  }
}
