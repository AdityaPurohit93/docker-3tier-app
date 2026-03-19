const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'appdb';

let dbConnection = null;

async function connectToDatabase() {
    try {
        dbConnection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });
        console.log('Connected to MySQL database');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

app.get('/health', (req, res) => {
    res.json({ status: 'Backend is running', timestamp: new Date() });
});

app.get('/db-health', async (req, res) => {
    if (dbConnection) {
        try {
            const connection = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                database: DB_NAME
            });
            await connection.end();
            res.json({ status: 'Database is connected', timestamp: new Date() });
        } catch (error) {
            res.status(500).json({ status: 'Database connection failed', error: error.message });
        }
    } else {
        res.status(500).json({ status: 'Database not initialized' });
    }
});

app.post('/api/hello', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (dbConnection) {
            const query = 'INSERT INTO users (name, created_at) VALUES (?, NOW())';
            await dbConnection.execute(query, [name]);
        }

        const message = `Hello ${name}! Your request has been processed.`;
        res.json({
            message: message,
            receivedName: name,
            timestamp: new Date(),
            status: 'success'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectToDatabase();
});