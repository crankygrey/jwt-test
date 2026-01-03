const httpHelper = {
    /**
     * REQUEST LOGIC: Dealing with incoming data
     */
    async getBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (err) {
                    reject(new Error("Invalid JSON format"));
                }
            });
            req.on('error', (err) => reject(err));
        });
    },

    /**
     * RESPONSE LOGIC: Dealing with outgoing data
     */
    send(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    },

    // 200 Success
    success(res, data = { success: true }) {
        this.send(res, 200, data);
    },

    // 201 Created
    created(res, data) {
        this.send(res, 201, data);
    },

    // 400 Client Error
    badRequest(res, message = "Bad Request") {
        this.send(res, 400, { success: false, error: message });
    },

    // 401 Unauthorized
    unauthorized(res, message = "Unauthorized") {
        this.send(res, 401, { success: false, error: message });
    },

    // 404 Not Found
    notFound(res, message = "Resource not found") {
        this.send(res, 404, { success: false, error: message });
    },

    // 500 Server Error
    error(res, message = "Internal Server Error") {
        this.send(res, 500, { success: false, error: message });
    }
};

module.exports = httpHelper;
