import crypto from 'crypto';

/**
 * CCAvenue AES-128-CBC encryption utility
 */
const INIT_VECTOR = Buffer.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
]);

/**
 * Encrypts plain text string to CCAvenue hex format
 * @param {string} plainText 
 * @param {string} workingKey 
 * @returns {string} Hex encoded encrypted string
 */
export function encryptCCAvenue(plainText, workingKey) {
  if (!plainText || !workingKey) return '';
  try {
    const keyHash = crypto.createHash('md5').update(workingKey).digest();
    const cipher = crypto.createCipheriv('aes-128-cbc', keyHash, INIT_VECTOR);
    let encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
  } catch (error) {
    console.error('[CCAvenue Crypto] Encryption error:', error);
    throw new Error('CCAvenue encryption failed');
  }
}

/**
 * Decrypts CCAvenue hex string back to plain text
 * @param {string} encText 
 * @param {string} workingKey 
 * @returns {string} Decrypted string
 */
export function decryptCCAvenue(encText, workingKey) {
  if (!encText || !workingKey) return '';
  try {
    const keyHash = crypto.createHash('md5').update(workingKey).digest();
    const decipher = crypto.createDecipheriv('aes-128-cbc', keyHash, INIT_VECTOR);
    let decoded = decipher.update(encText, 'hex', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
  } catch (error) {
    console.error('[CCAvenue Crypto] Decryption error:', error);
    throw new Error('CCAvenue decryption failed');
  }
}

/**
 * Helper to parse decrypted query string into an object
 * @param {string} queryString 
 * @returns {Record<string, string>}
 */
export function parseCCAvenueParams(queryString) {
  if (!queryString) return {};
  const params = {};
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = decodeURIComponent(pair.substring(0, idx).trim());
      const val = decodeURIComponent(pair.substring(idx + 1).trim());
      params[key] = val;
    }
  }
  return params;
}
