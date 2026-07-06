import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.API_SECRET_KEY || 'default-secret-key-123456789012';

export const encryptData = (data) => {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) return null;
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
