const { Pool } = require('pg');

// src/db.js

require('dotenv').config();
console.log('Using DATABASE_URL from env:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
}

// Enable SSL for many cloud providers (e.g., Render, Heroku). If you run locally
// without SSL, set NODE_ENV !== 'production' or provide a non-ssl DATABASE_URL.
const useSsl = process.env.NODE_ENV === 'production' || /sslmode=require/i.test(connectionString);

const pool = new Pool({
    connectionString,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    max: parseInt(process.env.PG_MAX_CLIENTS, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS, 10) || 2000
});

pool.on('error', (err) => {
    console.error('Unexpected idle client error', err);
    // application may decide to exit here depending on severity
});

async function testDbConnection() {
    const res = await pool.query('SELECT NOW() AS now');
    return res.rows[0].now;
}

function query(text, params) {
    return pool.query(text, params);
}

async function closePool() {
    await pool.end();
}

async function connectAndTest() {
    try {
        const now = await testDbConnection();
        console.log('✅ Connected to DB, now:', now);
    } catch (err) {
        console.error('❌ Failed to connect to DB:', err);
        throw err;
    }
}

// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((sig) => {
    process.on(sig, async () => {
        try {
            await closePool();
        } finally {
            process.exit(0);
        }
    });
});

module.exports = {
    pool,
    query,
    testDbConnection,
    closePool,
    connectAndTest
};