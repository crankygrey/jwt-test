const Project = require('../models/Project');
const httpHelper = require('../utils/httpHelper');

const ProjectController = {
    async handleGetUserProjects(req, res) {
        try {
            // The 'protect' middleware already verified the token 
            // and gave us the userId here:
            const userId = req.user.userId;
            const projects = await Project.findAllByUserId(userId);

            httpHelper.success(res, {
                projects: projects
            });
        } catch (err) {
            console.error(err);
            httpHelper.error(res, "Could not fetch your projects");
        }
    },

    async handleCreateProject(req, res) {
        try {
            const { name, description } = await httpHelper.getBody(req);
            const userId = req.user.userId;
            const project = await Project.create(name, description, userId);

            httpHelper.success(res, project);
        } catch (err) {
            console.error(err);
            httpHelper.error(res, "Could not create project");
        }
    }
};

module.exports = ProjectController;
