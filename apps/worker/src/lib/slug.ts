const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const LENGTH = 8;
// largest multiple of 36 below 256; bytes at or above it are rejected so every char is equally likely
const LIMIT = 256 - (256 % CHARS.length);
const SLUG_PATTERN = new RegExp(`^[a-z0-9]{${LENGTH}}$`);

export function generateSlug(): string {
  let slug = "";
  while (slug.length < LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(LENGTH * 2))) {
      if (byte < LIMIT) slug += CHARS[byte % CHARS.length];
      if (slug.length === LENGTH) break;
    }
  }
  return slug;
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
