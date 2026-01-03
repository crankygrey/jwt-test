const http = require('http');
const routes = require('./routes');
const httpHelper = require('./utils/httpHelper');

const PORT = process.env.PORT || 3000;
const server = http.createServer(async (req, res) => {
    // 1. Create the lookup key
    const routeKey = `${req.method} ${req.url}`;
    const handler = routes[routeKey];

    if (handler) {
        try {
            // 2. Execute handler
            await handler(req, res);
        } catch (err) {
            console.error(err);
            // 3. Use helper for 500
            httpHelper.error(res, "Internal Server Error");
        }
    } else {
        // 4. Use helper for 404
        httpHelper.notFound(res, "Route not found");
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
