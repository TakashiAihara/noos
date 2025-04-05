const { floor, log2, max, min } = Math;

/**
 * Mask the string except for the beginning and end
 * @param input - string to mask
 * @param maskChar - character to use for masking
 * @returns - masked string
 * @example mask('abcdefgh') // "a******h"
 */
export const mask = ({
  input,
  maskChar = '*',
}: {
  input?: string | null;
  maskChar?: string;
}) => {
  if (!input) return '';

  const { length } = input;

  if (length <= 2) {
    return maskChar.repeat(length);
  }

  const visibleCount = min(4, max(1, floor(log2(length) - 2)));

  const start = input.slice(0, visibleCount);
  const end = input.slice(-visibleCount);
  const masked = maskChar.repeat(length - visibleCount * 2);

  return `${start}${masked}${end}`;
};
