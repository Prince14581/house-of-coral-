// src/modules/Identity/verification/KycService.js
const FaceModule = require('./face/FaceVerifier');
const DocModule = require('./passport/DocVerifier');

class KycService {
    static async verifyFullIdentity(userId, documentData, faceImage) {
        // 1. Validate ID document (OCR/Passport check)
        const docValid = await DocModule.verify(documentData);
        
        // 2. Perform Liveness check (Biometric match)
        const faceMatch = await FaceModule.compare(faceImage, documentData.photo);
        
        if (docValid && faceMatch) {
            return { status: 'VERIFIED', level: 2 };
        }
        throw new Error('Identity verification failed');
    }
}
