const pool = require("../config/database");

exports.getMatches = async (req, res) => {
  const { username } = req.params;
  
  try {
    // D'abord, récupérez les matchs
    const matchQuery = `
      SELECT user1, user2, matched_at 
      FROM "Match"
      WHERE user1 = $1 OR user2 = $1
      ORDER BY matched_at DESC;
    `;
    
    const { rows } = await pool.query(matchQuery, [username]);
    
    if (rows.length === 0) {
      return res.json([]);
    }
    
    // Extraire les noms d'utilisateur des utilisateurs correspondants
    const matchedUsernames = rows.map(row => 
      row.user1 === username ? row.user2 : row.user1
    );
    
    // Récupérer les détails complets des utilisateurs correspondants
    const userDetailsQuery = `
      SELECT username, firstname, profile_picture, birth_date
      FROM "User"
      WHERE username = ANY($1);
    `;
    
    const userDetails = await pool.query(userDetailsQuery, [matchedUsernames]);
    
    // Créer un mappage des noms d'utilisateur aux détails complets
    const userMap = {};
    userDetails.rows.forEach(user => {
      userMap[user.username] = user;
    });
    
    // Construire le résultat final avec les informations complètes et la date de correspondance
    const matchesWithDetails = rows.map(row => {
      const matchedUsername = row.user1 === username ? row.user2 : row.user1;
      const userDetails = userMap[matchedUsername];
      
      return {
        username: userDetails.username,
        firstname: userDetails.firstname,
        profile_picture: userDetails.profile_picture,
        birth_date: userDetails.birth_date,
        matched_at: row.matched_at
      };
    });
    
    res.json(matchesWithDetails);
    
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
