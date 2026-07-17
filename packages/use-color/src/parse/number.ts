/**
 * @module parse/number
 *
 * Shared strict number-token regex source used across color parsers.
 *
 * A "strict" number token is one that consumes exactly what `Number.parseFloat`
 * would consume and nothing more — so composing it into a larger anchored
 * regex means malformed tokens (e.g. multi-dot numbers like "1.2.3", or
 * trailing garbage) fail to match at all, instead of being silently
 * truncated by `parseFloat`.
 *
 * Scientific notation (e.g. "1e2") is accepted everywhere for CSS
 * conformance, matching how `${number}` template-literal types already
 * accept exponential numeric strings.
 */

/** Unsigned numeric body: integer/decimal digits, optional exponent (no sign). */
const NUM_BODY = "(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][+-]?\\d+)?";

/** Strict numeric token: optional sign, integer/decimal digits, optional exponent. */
export const NUM = `[+-]?${NUM_BODY}`;

/** Strict numeric token with a required trailing percent sign. */
export const NUM_PCT = `${NUM}%`;

/** Strict numeric token with an optional trailing percent sign. */
export const NUM_OPT_PCT = `${NUM}%?`;
