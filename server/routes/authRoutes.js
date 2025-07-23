import express from "express";
import { register, login, logout, onboard, getAllUsersExceptCurrent } from "../controllers/authControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

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

export default  router;