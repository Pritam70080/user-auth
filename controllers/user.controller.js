import User from "../models/user.model.js";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required.",
            success: false
        })
    }
    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be atleast of 6 characters",
            success: false
        })
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists."
            })
        }
        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
        const newUser = await User.create({ name, email, password, verificationToken: token, verificationTokenExpiry: tokenExpiry });
        if (!newUser) {
            return res.status(404).json({
                message: "Failed to register user.",
                success: false,
            })
        }
        await sendVerificationEmail(newUser.email, token);

        res.status(201).json({
            success: true,
            message: "User registered successfully, Now you need to verify your email"
        })
    } catch (error) {
        console.error("Error Registering user: ", error);
        res.status(500).json({
            error: "Internal server error",
            success: false
        })
    }
}

export const verify = async (req, res) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "token is required!"
        })
    }
    try {
        const user = await User.findOne({ verificationToken: token, verificationTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            })
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();
        req.user = user;
        res.status(200).json({
            message: "User verified successfully",
            success: true
        })
    } catch (error) {
        console.error("Error verifying user: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify user"
        })
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "User account is not verified"
            })
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            })
        }
        // const jwtToken = await jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY});
        const accessToken = await jwt.sign({ id: user._id }, process.env.ACCESSTOKEN_SECRET, { expiresIn: process.env.ACCESSTOKEN_EXPIRY || "15m" });
        const refreshToken = await jwt.sign({ id: user._id }, process.env.REFRESHTOKEN_SECRET, { expiresIn: process.env.REFRESHTOKEN_EXPIRY || "1d" });

        // const cookieOptions = {
        //     httpOnly: true,
        //     secure: true,
        //     maxAge: 24 * 60 * 60 * 1000
        // }
        // res.cookie("jwtToken", jwtToken, cookieOptions);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            message: "User logged in successfully"
        })
    } catch (error) {
        console.error("Error loggingin user: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to login user"
        })
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById({ _id: userId }).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid token"
            })
        }
        res.status(200).json({
            success: true,
            message: "User profile accessed",
            user
        })
    } catch (error) {
        console.error("Error getting user profile: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get user profile"
        })
    }
}
export const logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized access",
                success: false
            })
        }
        const user = await User.findById({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        user.refreshToken = null;
        await user.save();
        res.cookie("accessToken", null, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 0
        });
        res.cookie("refreshToken", null, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 0
        });
        res.status(200).json({
            success: true,
            message: "User logged successfully"
        })
    } catch (error) {
        console.error("Error logging out: ", error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        })
    }
}


