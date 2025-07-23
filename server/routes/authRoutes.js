const express = require("express");
const { register, login, logout, onboard, getAllUsersExceptCurrent } = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.post('/onboarding', authMiddleware, onboard);

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/users', authMiddleware, getAllUsersExceptCurrent);

module.exports = router;