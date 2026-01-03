const jwt = require('jsonwebtoken');
const http = require('../utils/httpHelper');

const protect = (handler) => {
    return async (req, res) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Extract "Bearer TOKEN"

            if (!token) return http.unauthorized(res, "Access denied. No token provided.");

            // Verify the 15-minute Access Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user info to req so the controller can use it
            req.user = decoded; 

            // If everything is okay, run the actual controller handler
            return await handler(req, res);
        } catch (err) {
            return http.unauthorized(res, "Token expired or invalid");
        }
    };
};

module.exports = { protect };
