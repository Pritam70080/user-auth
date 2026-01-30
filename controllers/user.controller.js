import User from "../models/user.model.js";
import crypto from "crypto";
import {sendVerificationEmail, generateForgotPasswordEmail, generateVerifyEmail }from "../utils/sendMail.js";
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
        const mailOptions = generateVerifyEmail(newUser.email, token);
        const isSent = await sendVerificationEmail(mailOptions);
        if(!isSent) {
            return res.status(400).json({
                message: "Failed to send mail",
                success: false
            })
        }
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

export const resendEmailVerification = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            })
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }
        if(user.isVerified) {
            return res.status(400).json({
                message: "User email is already verified",
                success: false
            })
        }
        const token = await crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
        user.verificationToken = token;
        user.verificationTokenExpiry = tokenExpiry;
        await user.save();
        const mailOptions = generateVerifyEmail(email, token);
        const mail = await sendVerificationEmail(mailOptions);
        if(!mail) {
            return res.status(400).json({
                message: "Mail couldn't sent",
                success: false
            })
        }
        return res.status(200).json({
            message: "Verification email send successfully",
            success: true
        })
    } catch (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            })
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }
        const token = await crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 5 * 60 * 1000;
        user.resetPasswordToken = token;
        user.resetPasswordTokenExpiry = tokenExpiry;
        await user.save();
        const mailOptions = generateForgotPasswordEmail(email, token);
        const isSent = await sendVerificationEmail(mailOptions);
        if(!isSent) {
            return res.status(400).json({
                message: "Failed to send mail",
                success: false
            })
        }
        return res.status(200).json({
            message: "Reset password initiated",
            success: true
        })
    } catch (error) {
        console.error("Error handling forgot password", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        if(!password) {
            return res.status(400).json({
                message: "Password is required",
                success: false
            })
        }
        if(password.length < 6) {
            return res.status(400).json({
                message: "Password must be of 6 characters",
                success: false
            })
        }
        const user = await User.findOne({resetPasswordToken: token, resetPasswordTokenExpiry: {$gt: Date.now()}});
        if(!user) {
            return res.status(400).json({
                message: "Invalid token or Session expired",
                success: false
            })
        }
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();
        return res.status(200).json({
            message: "Password updated successfully",
            success: true
        })
    } catch (error) {
        console.error("Error updating the password", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}