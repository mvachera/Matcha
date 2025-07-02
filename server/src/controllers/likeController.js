/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   likeController.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mvachera <mvachera@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/03/13 21:48:41 by mvachera          #+#    #+#             */
/*   Updated: 2025/04/24 18:37:24 by mvachera         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const pool = require("../config/database");

exports.getLikesSent = async (req, res) => {
  const username = req.user.username;

  try {
    // D'abord, vérifions que nous pouvons obtenir les données de base
    const query = `
		SELECT liked, created_at
		FROM "_Like"
		WHERE liker = $1
		ORDER BY created_at DESC
	  `;
    const { rows } = await pool.query(query, [username]);

    // Si nous n'avons pas les informations des users directement,
    // Récupérons-les une par une
    const usersWithDetails = [];

    for (const row of rows) {
      try {
        const userQuery = `
			SELECT *
			FROM "User" 
			WHERE username = $1
		  `;

        const userResult = await pool.query(userQuery, [row.liked]);

        if (userResult.rows.length > 0) {
          usersWithDetails.push(userResult.rows[0]);
        } else {
          // Si l'utilisateur n'est pas trouvé, ajoutons au moins le username
          usersWithDetails.push({
            username: row.liked,
            firstname: row.liked,
            profile_picture: null,
            birth_date: null,
          });
        }
      } catch (userError) {
        console.error(`Erreur pour l'utilisateur ${row.liked}:`, userError);
      }
    }

    res.json(usersWithDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération des likes envoyés:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

exports.unlikeUser = async (req, res) => {
  const liker = req.user.username;
  const liked = req.params.username;

  // Validation des données reçues
  if (!liker || !liked) {
    return res.status(400).json({ error: "Les noms d'utilisateur du liker et du liked sont requis" });
  }

  try {
    // Vérifier d'abord si le like existe
    const checkQuery = `
		SELECT * FROM "_Like"
		WHERE liker = $1 AND liked = $2
	  `;

    const checkResult = await pool.query(checkQuery, [liker, liked]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Like non trouvé" });
    }

    // Supprimer le like
    const deleteQuery = `
		DELETE FROM "_Like"
		WHERE liker = $1 AND liked = $2
	  `;

    await pool.query(deleteQuery, [liker, liked]);

    res.status(200).json({ message: "Unlike effectué avec succès" });
  } catch (error) {
    console.error("Erreur lors du unlike:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

exports.getLikesReceived = async (req, res) => {
  const username = req.user.username;
  
  try {
    // D'abord, récupérons les utilisateurs qui ont liké l'utilisateur actuel
    const query = `
      SELECT liker, created_at
      FROM "_Like"
      WHERE liked = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [username]);
    
    // Récupérons les détails de chaque utilisateur qui a liké
    const usersWithDetails = [];
    
    for (const row of rows) {
      try {
        const userQuery = `
          SELECT *
          FROM "User" 
          WHERE username = $1
        `;
        
        const userResult = await pool.query(userQuery, [row.liker]);
        
        if (userResult.rows.length > 0) {
          usersWithDetails.push(userResult.rows[0]);
        } else {
          // Si l'utilisateur n'est pas trouvé, ajoutons au moins le username
          usersWithDetails.push({
            username: row.liker,
            firstname: row.liker,
            profile_picture: null,
            birth_date: null,
          });
        }
      } catch (userError) {
        console.error(`Erreur pour l'utilisateur ${row.liker}:`, userError);
      }
    }
    
    res.json(usersWithDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération des likes reçus:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

exports.addLike = async (req, res) => {
  const liker = req.user.username;
  const liked = req.body.liked;

  console.log("Ajout du like:", liker, liked);
  if (!liker || !liked) {
    return res.status(400).json({ error: "Les deux utilisateurs sont requis" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if the liked user exists
    const userLiked = await client.query('SELECT username, firstname, profile_picture, birth_date FROM "User" WHERE username = $1', [liked]);

    if (userLiked.rowCount === 0) {
      return res.status(404).json({ error: "L'utilisateur n'existe pas" });
    }

    // Get liked user data
    const likedUserData = userLiked.rows[0];

    // Check if the like already exists
    const checkExistingLike = await client.query('SELECT 1 FROM "_Like" WHERE "liker" = $1 AND "liked" = $2', [liker, liked]);

    if (checkExistingLike.rowCount > 0) {
      return res.status(400).json({ error: "Vous avez déjà liké cet utilisateur" });
    }

    // Add the like to the database
    await client.query('INSERT INTO "_Like" ("liker", "liked") VALUES ($1, $2)', [liker, liked]);

    // Check if a match was created (the match trigger should create it automatically)
    const checkMatch = await client.query('SELECT matched_at FROM "Match" WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)', [liker, liked]);

    await client.query("COMMIT");

    // Format date for consistent response
    const formattedBirthDate = likedUserData.birth_date ? new Date(likedUserData.birth_date).toISOString() : null;

    if (checkMatch.rowCount > 0) {
      return res.status(201).json({
        message: "C'est un match!",
        isMatch: true,
        match: {
          match_with: liked,
          matched_at: checkMatch.rows[0].matched_at,
        },
        likedUser: {
          username: likedUserData.username,
          firstname: likedUserData.firstname,
          profile_picture: likedUserData.profile_picture,
          birth_date: formattedBirthDate,
        },
      });
    }

    return res.status(201).json({
      message: "Like ajouté avec succès",
      isMatch: false,
      likedUser: {
        username: likedUserData.username,
        firstname: likedUserData.firstname,
        profile_picture: likedUserData.profile_picture,
        birth_date: formattedBirthDate,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de l'ajout du like:", error);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
};
