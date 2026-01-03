const User = require('../models/User');
const httpHelper = require('../utils/httpHelper');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const UserController = {
    /**
     * HANDLER: POST /register
     */
    async handleRegister(req, res) {
        try {
            const { username, email, password } = await httpHelper.getBody(req);

            // Using the new badRequest helper
            if (!email || !password) {
                return httpHelper.badRequest(res, "Email and password are required");
            }

            const newUser = await User.create({ username, email, password });

            // Using the new created helper
            httpHelper.created(res, {
                success: true,
                user: newUser
            });
        } catch (err) {
            console.error("Registration Error:", err.message);
            httpHelper.error(res, "Registration failed");
        }
    },

    /**
     * HANDLER: POST /login
     */
    async handleLogin(req, res) {
        try {
            const { email, password } = await httpHelper.getBody(req);
            
            if (!email || !password) {
                return httpHelper.badRequest(res, "Email and password are required");
            }

            const result = await this.performLoginLogic(email, password);

            // Using the new success helper
            httpHelper.success(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user
            });

        } catch (err) {
            console.error("Login Error:", err.message);
            // Using the new unauthorized helper
            httpHelper.unauthorized(res, err.message);
        }
    },

    /**
     * INTERNAL LOGIC
     */
    async performLoginLogic(email, password) {
        const userData = await User.findByEmail(email);
        if (!userData) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, userData.password_hash);
        if (!isMatch) throw new Error("Invalid credentials");

        const user = new User(userData);

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(40).toString('hex');

        // Update the 'token' column in DB
        await user.update({ token: refreshToken });

        return { accessToken, refreshToken, user };
    },

    async handleGetCurrentUser(req, res) {
         try {
            // The 'protect' middleware already verified the token 
            // and gave us the userId here:
            const userId = req.user.userId;

            const user = await User.findById(userId);

            httpHelper.success(res, user);
        } catch (err) {
            console.error(err);
            httpHelper.error(res, "Could not fetch your projects");
        }
    },

    async handleRefreshToken(req, res) {
        try {
            const { refreshToken } = await httpHelper.getBody(req);

            if (!refreshToken) return httpHelper.unauthorized(res, "Refresh token required");

            // 1. Check if this token exists in our DB
            const userData = await User.findByRefreshToken(refreshToken);
            if (!userData) return httpHelper.unauthorized(res, "Invalid refresh token");

            // 2. Token is valid! Generate a NEW 15-minute Access Token
            const accessToken = jwt.sign(
                { userId: userData.id, email: userData.email },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            // 3. Send the new key to the frontend
            httpHelper.success(res, { accessToken });

        } catch (err) {
            httpHelper.error(res, "Refresh failed");
        }
    }
};

module.exports = UserController;
