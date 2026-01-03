const { query } = require('../db/dbWrapper');
const bcrypt = require('bcrypt');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.token = data.token; // Refresh token column
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    static async create({ email, password }) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING id, email, created_at, updated_at`,
            [email, passwordHash]
        );

        return new User(result.rows[0]);
    }

    static async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        return new User(result.rows[0]);
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        return new User(result.rows[0]);
    }

    // UPDATE: Used for Refresh Tokens or Profile changes
    async update(updates) {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        if (fields.length === 0) return this;

        values.push(this.id);
        
        const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
                     WHERE id = $${index} RETURNING *`;
        
        const result = await query(sql, values);
        
        return new User(result.rows[0]);
    }

    async delete() {
        await query('DELETE FROM users WHERE id = $1', [this.id]);
        return true;
    }

    static async findByRefreshToken(token) {
        const result = await query(
            'SELECT * FROM users WHERE token = $1', 
            [token]
        );

        return new User(result.rows[0]);
    }
}

module.exports = User;
