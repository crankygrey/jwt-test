const UserController = require('./controllers/userController');
const ProjectController = require('./controllers/projectController');
const { protect } = require('./middleware/authMiddleware');

const routes = {
    // Public Routes (No token needed)
    'POST /refresh-token': (req, res) => UserController.handleRefreshToken(req, res),
    'POST /register': (req, res) => UserController.handleRegister(req, res),
    'POST /login': (req, res) => UserController.handleLogin(req, res),

    // Protected Routes (Token REQUIRED)
    'GET /users/me': protect((req, res) => UserController.handleGetCurrentUser(req, res)),
    'GET /my-projects': protect((req, res) => ProjectController.handleGetUserProjects(req, res)),

    'POST /create-project': protect((req, res) => ProjectController.handleCreateProject(req, res)),
};

module.exports = routes;
