/**
 * Stable error codes returned by the CamelMailer API, plus the two
 * client-side codes (`NetworkError`, `InvalidResponseError`) this SDK
 * produces when no API error envelope is available.
 */
export type CamelMailerErrorCode =
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'NotAvailable'
  | 'ValidationError'
  | 'ParameterMissing'
  | 'InvalidCredentials'
  | 'RegistrationDisabled'
  | 'BillingDisabled'
  // The server's 30-day send allowance is used up. Answered with HTTP 429
  // before anything is stored, so nothing was queued and a retry after the
  // window moves on will work.
  | 'SendLimitExceeded'
  // An Idempotency-Key was reused for a different request body, or sent
  // twice on one request. Answered with HTTP 409.
  | 'InvalidIdempotentRequest'
  | 'InternalServerError'
  | 'NetworkError'
  | 'InvalidResponseError'
  // Future/unknown codes stay assignable without widening to plain string.
  | (string & {});

/**
 * A typed CamelMailer error.
 *
 * API methods never throw for request failures — they resolve to
 * `{ data: null, error: CamelMailerError }`. Branch on `error.code`
 * (stable across releases) rather than on the message text.
 */
export class CamelMailerError extends Error {
  override name = 'CamelMailerError';

  /** Stable machine-readable code, e.g. `ValidationError`. */
  readonly code: CamelMailerErrorCode;

  /** HTTP status of the response, or `null` when the request never got one. */
  readonly statusCode: number | null;

  constructor(
    message: string,
    code: CamelMailerErrorCode,
    statusCode: number | null = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.code = code;
    this.statusCode = statusCode;
  }
}
