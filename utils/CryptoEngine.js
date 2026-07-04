// utils/CryptoEngine.js
const crypto = require('crypto');

class CryptoEngine {
    static ALGORITHM = 'aes-256-gcm';

    static encrypt(text, secretKey) {
        const iv = crypto.randomBytes(12); // Initialization Vector
        const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag(); // Authentication tag for integrity

        return {
            content: encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    static decrypt(encryptedData, secretKey) {
        const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
