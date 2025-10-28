import { customAlphabet } from "nanoid";

/**
 * Generate a unique session code (9-11 characters)
 * Similar to Zoom meeting IDs
 */
export function generateSessionCode(): string {
  // Use custom alphabet for shorter, more readable codes
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, 10);
  return nanoid();
}

/**
 * Validate session code format
 */
export function isValidSessionCode(code: string): boolean {
  return /^[0-9A-Z]{9,11}$/.test(code);
}

/**
 * Generate a shareable session URL
 */
export function getSessionUrl(code: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${code}`;
}
