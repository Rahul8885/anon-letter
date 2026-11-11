/** How long a letter and its link live before the daily purge hard-deletes it. */
export const LETTER_TTL_DAYS = 180;
export const LETTER_TTL_SECONDS = LETTER_TTL_DAYS * 24 * 60 * 60;
/** Reader-facing wording for the same window. Keep in sync with LETTER_TTL_DAYS. */
export const LETTER_TTL_LABEL = "six months";
