const jwt = require('jsonwebtoken');
const User = require("../models/User.js");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized! No token.' }); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ message: "Unauthorized! User not found." });

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }
};

export default authMiddleware;
