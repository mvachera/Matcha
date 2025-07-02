const { Pool } = require("pg");

// Create a PostgreSQL connection pool
// Use either individual parameters OR connection string, not both
const pool = new Pool({
  // If DATABASE_URL is provided, use it
  ...(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  } : {
    // Otherwise use individual parameters
    user: "moha",
    host: "localhost",
    database: "matchy-matchy-db",
    password: "mdp",
    port: 5432
  })
});

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Successfully connected to the database");
    done();
  }
});

module.exports = pool;