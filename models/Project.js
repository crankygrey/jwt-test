const { query } = require('../db/dbWrapper');

class Project {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.ownerId = data.owner_id;
    }

    // Pass the userId as an argument
    static async findAllByUserId(userId) {
        const result = await query(
            'SELECT * FROM projects WHERE owner_id = $1',
            [userId]
        );

        return result.rows.map(row => new Project(row));
    }

    /**
     * Create project
     */
    static async create(name, description, ownerId) {
        const result = await query(
            `INSERT INTO projects (name, description, owner_id)
                VALUES ($1, $2, $3)
                RETURNING id, name, description, owner_id, created_at, updated_at`,
            [name, description, ownerId]
        );

        return new Project(result.rows[0]);
    }
}

module.exports = Project;
