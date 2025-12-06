import pg from "pg";          // Import the 'pg' library (PostgreSQL client for Node.js)
import dotenv from "dotenv";  // Import dotenv to load environment variables

// Load environment variables from the .env file into process.env
dotenv.config();

// Extract the Pool class from the pg module
const { Pool } = pg;

/**
 * Create a new PostgreSQL connection pool.
 * A pool maintains multiple connections to the database,
 * improving performance by reusing existing connections instead of creating new ones.
 *
 * All values are taken from environment variables for security.
 * If any variable is missing, fallback defaults are used (for development only).
 */
const pool = new Pool({
  user: process.env.DB_USER || "postgres",           
  host: process.env.DB_HOST || "localhost",          
  database: process.env.DB_NAME || "company_db",     
  password: process.env.DB_PASSWORD,                 
  port: process.env.DB_PORT || 5432,                 
});

/**
 * Test the database connection by executing a simple query.
 * 'SELECT NOW()' returns the current timestamp from PostgreSQL,
 * confirming that the connection is working properly.
 */
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);      // Log error if connection fails
  } else {
    console.log("Database connected successfully:", res.rows[0].now); // Success message
  }
});

// Export the pool so it can be used across the project
export default pool;
