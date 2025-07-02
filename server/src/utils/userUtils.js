const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function getUserFromToken(token) {
  const client = await pool.connect();
  
  try {
    const secretKey = process.env.JWT_SECRET;
    const isVerified = jwt.verify(token, secretKey);
    
    if (!isVerified) {
      throw new Error("Unauthorized");
    }
    
    const query = `
      SELECT * 
      FROM "User"
      WHERE username = $1
    `;
    
    const result = await client.query(query, [isVerified.username]);
    
    if (result.rowCount === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Convert snake_case to camelCase for consistency
    return {
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profile_complete: user.profile_complete,
      sexual_preferences: user.sexual_preferences,
      gender: user.gender,
      birth_date: user.birth_date,
      biography: user.biography,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      interests: user.interests,
      authorize_location: user.authorize_location,
      pictures: user.pictures,
      location_id: user.location_id
    };
  } catch (e) {
    console.log(e);
    return null;
  } finally {
    client.release();
  }
}

module.exports = {
  getUserFromToken,
};