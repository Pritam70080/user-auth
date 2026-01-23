import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        // const jwtToken  = req.cookies?.jwtToken;
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;
        // if (!jwtToken) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Token not found"
        //     })
        // }
        // const decoded = await jwt.verify(jwtToken, process.env.JWT_SECRET);
        if (!accessToken && !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "User is not logged in"
            })
        }
        if (accessToken) {
            try {
                const decodedAccessToken = await jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
                const user = await User.findById({ _id: decodedAccessToken.id });
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized access"
                    })
                }
                console.log("Access Token authenticated");
                req.user = decodedAccessToken;
                return next();
            } catch (error) {
                console.error("Access token is expired: ", error);
            }
        }
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
        }
        else {
            try {
                const decodedRefreshToken = await jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);
                const user = await User.findById({ _id: decodedRefreshToken.id });
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized access"
                    })
                }
                if(user.refreshToken !== refreshToken) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid refresh token"
                    })
                }
                const newAccessToken = await jwt.sign({ id: user._id }, process.env.ACCESSTOKEN_SECRET, { expiresIn: process.env.ACCESSTOKEN_EXPIRY });
                const newRefreshToken = await jwt.sign({ id: user._id }, process.env.REFRESHTOKEN_SECRET, { expiresIn: process.env.REFRESHTOKEN_EXPIRY });
                user.refreshToken = newRefreshToken;
                await user.save();
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 15 * 60 * 1000,
                });
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                console.log("Refresh Token authenticated");
                req.user = decodedRefreshToken;
                return next();
            } catch (error) {
                console.error("Error validating token: ", error);
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access"
                })
            }
        }
    } catch (error) {
        console.error("Error validating token: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
//There is no need of regeneration of refresh and access token is access token is correctly verified.
// Error occurs in inner try

// Inner catch handles it

// Execution continues normally

// Code after inner block still runs

// Outer catch is NOT triggered