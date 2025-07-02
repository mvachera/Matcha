const pool = require("../config/database");

async function alreadyInDatabase(email, username) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT username 
      FROM "User"
      WHERE email = $1 OR username = $2
      LIMIT 1
    `;
    
    const result = await client.query(query, [email, username]);
    
    return result.rowCount > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error checking database:", error);
    return null;
  } finally {
    client.release();
  }
}

module.exports = {
  alreadyInDatabase,
};