// Import the Express framework to build the API server
import express from 'express';

/**
 * CORS (Cross-Origin Resource Sharing)
 * ------------------------------------
 * This middleware allows your backend to accept requests from 
 * different domains/origins (e.g., your frontend running on localhost:3000).
 * Without CORS, browsers block cross-domain API calls for security reasons.
 */
import cors from 'cors';

/**
 * Helmet
 * ------
 * Helmet helps secure Express apps by setting various HTTP headers.
 * It protects against common web vulnerabilities such as:
 * - Cross-Site Scripting (XSS)
 * - Clickjacking
 * - MIME type sniffing
 */
import helmet from 'helmet';

/**
 * Compression
 * -----------
 * This middleware compresses server responses using GZIP,
 * reducing the size of data sent to the client.
 * Smaller response size = faster load times = better performance.
 */
import compression from 'compression';

/**
 * Dotenv
 * ------
 * Loads environment variables from a .env file into process.env.
 * This keeps sensitive data (like DB passwords, API keys) outside your code.
 */
import dotenv from 'dotenv';

// Import database connection (pool) to ensure DB connects when server starts
import db from './src/config/db.js';

// Initialize environment variables
dotenv.config();

// Create an Express application instance
const app = express();

// Port number (from .env) or fallback default
const PORT = process.env.PORT || 5000;

/**
 * ----------------------------
 * Global Middleware (applies to all routes)
 * ----------------------------
 */
app.use(express.json());   // Parse incoming JSON payloads
app.use(cors());           // Enable CORS for all routes
app.use(helmet());         // Apply security headers
app.use(compression());    // Enable GZIP compression for responses

// Basic route to verify server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
