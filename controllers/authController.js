const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    // Basic login logic + JWT issuance
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // ... compare password ...
    const token = jwt.sign({ id: user._id, kyc: user.kycStatus }, process.env.JWT_SECRET);
    res.json({ token });
};
