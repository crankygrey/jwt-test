const pool = require('./pool');

class DatabaseError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

/**
 * Execute a query with parameters
 */
async function query(text, params = []) {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        console.log('Executed query', {
            text: text.substring(0, 100) + '...',
            duration,
            rows: result.rowCount
        });

        return result;
    } catch (error) {
        console.error('Database query error:', {
            text: text.substring(0, 100) + '...',
            params,
            error: error.message
        });
        throw new DatabaseError('Query execution failed', error);
    }
}

/**
 * Get a client from the pool for transactions
 */
async function getClient() {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        throw new DatabaseError('Failed to get database client', error);
    }
}

/**
 * Execute multiple queries in a transaction
 */
async function transaction(callback) {
    const client = await getClient();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw new DatabaseError('Transaction failed', error);
    } finally {
        client.release();
    }
}

module.exports = {
    query,
    getClient,
    transaction,
    DatabaseError
};
