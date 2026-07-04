// src/controllers/AuthController.js
const AuthService = require('../services/auth/AuthService');

class AuthController {
    static async login(req, res, next) {
        try {
            const { mobileNumber, otp } = req.body;
            
            // Validate input presence
            if (!mobileNumber || !otp) {
                return res.status(400).json({ error: 'Mobile and OTP are required' });
            }

            const result = await AuthService.authenticate(mobileNumber, otp);
            
            // Successful response
            res.status(200).json({
                message: 'Authentication successful',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            // Pass the error to your central error handler
            next(error);
        }
    }
}

module.exports = AuthController;
