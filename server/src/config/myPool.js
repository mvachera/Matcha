// const { Pool } = require('pg');

// // Create a PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// // Test the database connection
// pool.connect((err, client, done) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//   } else {
//     console.log('Successfully connected to the database');
//     done();
//   }
// });

// module.exports = pool;