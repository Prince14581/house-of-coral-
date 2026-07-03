module.exports = (req, res, next) => {
    // Assuming your User model has a 'role' field
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin rights required." });
    }
};
