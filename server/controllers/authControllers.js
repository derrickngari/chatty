import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import cloudinary from '../config/uploads.js'

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !password || !email) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        const userExists = await User.findOne({ email});
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await User.create({ fullName, email, password });

        const token = jwt.sign({
            id: user._id,
            fullName: user.fullName,
        }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        // Convert Mongoose document to plain object
        const userObj = user.toObject();

        // Remove password field
        delete userObj.password

        res.status(201).json(user);
    } catch (error) {
        console.log(`Register controller error: ${error.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            fullname: user.fullName,
            avatar: user.profileImage
        }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.status(200).json(user);
    } catch (err) {
        console.log(`Login controller error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
    
}

export const logout = async (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logout successful' });
}

export const onboard = async (req, res) => {
    try {
        const id = req.user._id;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { username, bio, location, profileImage } = req.body;

        if (!username || !bio || !location || !profileImage) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userNameExists = await User.findOne({ username });
        if (userNameExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Upload image to Cloudinary
        let uploadedImageUrl = '';
        try {
            const uploadResponse = await cloudinary.uploader.upload(profileImage, {
                folder: 'chat-app-profiles',
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined,
            });
            uploadedImageUrl = uploadResponse.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            return res.status(500).json({ message: 'Image upload failed', error: err.message || err });
        }

        const updatedUser = await User.findByIdAndUpdate(id, {
            username,
            bio,
            location,
            profileImage: uploadedImageUrl,
            isOnboarded: true,
        }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User onboarded successfully", user: updatedUser })

    } catch (error) {
        console.error("Onboarding controller Error: ", error);
        return res.status(500).json({ message: "Server Error", error: error.message || error });
    }
}

export const getAllUsersExceptCurrent = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}