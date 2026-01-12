
const crypto = require('crypto');

/**
 * Creates a SHA-256 hash of a string (email).
 * This is "one-way", meaning we can't get the email back from the hash.
 */
export function hashEmail(email) {
    // Normalize email (lowercase and trim)
    const cleanEmail = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(cleanEmail).digest('hex');
}
