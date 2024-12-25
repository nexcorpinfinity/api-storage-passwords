import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.DECRYPT_SECURE_CODE;

console.log(secretKey);

function encryptSecretCode(secretCode: string) {
    const encrypted = CryptoJS.AES.encrypt(secretCode, String(secretKey)).toString();
    return encrypted;
}

console.log(encryptSecretCode('1234'));

function decryptSecretCode(encryptedCode: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedCode, String(secretKey));
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
        throw new Error('Código secreto inválido');
    }

    return decryptedData;
}

// para passar o hash precisa fazer isso no app
console.log(encodeURIComponent('U2FsdGVkX18x+UiyKEbCEVBOshRs0lOKG1KAWCl1QjA='), 'encoded ');

console.log(decryptSecretCode('U2FsdGVkX18x+UiyKEbCEVBOshRs0lOKG1KAWCl1QjA='));
