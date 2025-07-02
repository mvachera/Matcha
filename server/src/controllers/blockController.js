const pool = require("../config/database");

exports.addBlock = async (req, res) => {
	const blocker = req.user.username;
	const blocked = req.body.username;

  	// Validation des données reçues
  	if (!blocker || !blocked) {
		return res.status(400).json({ error: "Invalid data" });
  	}

	if (blocker === blocked) {
		return res.status(400).json({ error: "You cannot block yourself" });
	}

  	try {
	// Vérification si le blocage existe déjà
	const checkQuery = `
	  SELECT * FROM "Block"
	  WHERE blocker = $1 AND blocked = $2
	`;
	const { rows: existingBlocks } = await pool.query(checkQuery, [blocker, blocked]);

	if (existingBlocks.length > 0) {
	  return res.status(400).json({ error: "Already blocked" });
	}

	// Insertion du blocage dans la base de données
	const insertQuery = `
	  INSERT INTO "Block" (blocker, blocked)
	  VALUES ($1, $2)
	  RETURNING *
	`;
	const { rows: newBlock } = await pool.query(insertQuery, [blocker, blocked]);

	res.status(201).json(newBlock[0]);
  	} catch (error) {
		console.error("Error while blocking user:", error);
		res.status(500).json({ error: "Server error", details: error.message });
  	}
}

exports.addSignalement = async (req, res) => {
	const signaler = req.user.username;
	const signaled = req.body.username;

  	// Validation des données reçues
  	if (!signaler || !signaled) {
		return res.status(400).json({ error: "Invalid data" });
  	}

	if (signaler === signaled) {
		return res.status(400).json({ error: "You cannot signal yourself" });
	}

  	try {
	// Vérification si le blocage existe déjà
	const checkQuery = `
	  SELECT * FROM "Signal"
	  WHERE signaler = $1 AND signaled = $2
	`;
	const { rows: existingSignals } = await pool.query(checkQuery, [signaler, signaled]);

	if (existingSignals.length > 0) {
	  return res.status(400).json({ error: "Already signaled" });
	}

	// Insertion du blocage dans la base de données
	const insertQuery = `
	  INSERT INTO "Signal" (signaler, signaled)
	  VALUES ($1, $2)
	  RETURNING *
	`;
	const { rows: newSignal } = await pool.query(insertQuery, [signaler, signaled]);

	res.status(201).json(newSignal[0]);
  	} catch (error) {
		console.error("Error while signaling user:", error);
		res.status(500).json({ error: "Server error", details: error.message });
  	}
}

exports.deleteBlock = async (req, res) => {
	blocker = req.user.username;
	blocked = req.params.username;

  	// Validation des données reçues
  	if (!blocker || !blocked) {
		return res.status(400).json({ error: "Invalid data" });
  	}

  	try {
	// Vérification si le blocage existe
	const checkQuery = `
	  SELECT * FROM "Block"
	  WHERE blocker = $1 AND blocked = $2
	`;

	const { rows: existingBlocks } = await pool.query(checkQuery, [blocker, blocked]);

	if (existingBlocks.length === 0) {
	  return res.status(404).json({ error: "Block not found" });
	}
	// Suppression du blocage
	const deleteQuery = `
	  DELETE FROM "Block"
	  WHERE blocker = $1 AND blocked = $2
	`;

	await pool.query(deleteQuery, [blocker, blocked]);

	res.status(200).json({ message: "Block removed successfully" });
  	}
	catch (error) {
		console.error("Error while removing block:", error);
		res.status(500).json({ error: "Server error", details: error.message });
  	}
}

exports.getBlockedUsers = async (req, res) => {
	const username = req.user.username;
	
	try {
	  // Récupérons les utilisateurs que l'utilisateur actuel a bloqués
	  const query = `
		SELECT blocked, created_at
		FROM "Block"
		WHERE blocker = $1
		ORDER BY created_at DESC
	  `;
	  const { rows } = await pool.query(query, [username]);
	  
	  // Récupérons les détails de chaque utilisateur bloqué
	  const usersWithDetails = [];
	  
	  for (const row of rows) {
		try {
		  const userQuery = `
			SELECT *
			FROM "User" 
			WHERE username = $1
		  `;
		  
		  const userResult = await pool.query(userQuery, [row.blocked]);
		  
		  if (userResult.rows.length > 0) {
			usersWithDetails.push(userResult.rows[0]);
		  } else {
			// Si l'utilisateur n'est pas trouvé, ajoutons au moins le username
			usersWithDetails.push({
			  username: row.blocked,
			  firstname: row.blocked,
			  profile_picture: null,
			  birth_date: null,
			});
		  }
		} catch (userError) {
		  console.error(`Erreur pour l'utilisateur ${row.blocked}:`, userError);
		}
	  }
	  
	  res.json(usersWithDetails);
	} catch (error) {
	  console.error("Erreur lors de la récupération des utilisateurs bloqués:", error);
	  res.status(500).json({ error: "Erreur serveur", details: error.message });
	}
  };
