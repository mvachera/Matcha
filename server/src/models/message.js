const pool = require("../config/database");

/**
 * Message model functions for PostgreSQL
 */
const Message = {
  /**
   * Create a new message
   * @param {Object} message - Message object with sender, recipient, content
   * @returns {Promise<Object>} Created message
   */
  async create(message) {
    const { sender, recipient, content } = message;
    
    const query = `
      INSERT INTO "Message" (sender, recipient, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [sender, recipient, content]);
    return result.rows[0];
  },

  /**
   * Get conversation between two users
   * @param {string} user1 - First user's username
   * @param {string} user2 - Second user's username
   * @param {number} limit - Maximum number of messages to return
   * @returns {Promise<Array>} Array of messages
   */
  async getConversation(user1, user2, limit = 50) {
    const query = `
      SELECT *
      FROM "Message"
      WHERE (sender = $1 AND recipient = $2)
         OR (sender = $2 AND recipient = $1)
      ORDER BY timestamp ASC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [user1, user2, limit]);
    return result.rows;
  },

  /**
   * Get all conversations for a user
   * @param {string} username - User's username
   * @returns {Promise<Array>} Array of conversations with last message
   */
  async getUserConversations(username) {
    const query = `
      WITH recent_messages AS (
        SELECT DISTINCT ON (other_user)
          id,
          sender,
          recipient,
          content,
          read,
          timestamp,
          CASE
            WHEN sender = $1 THEN recipient
            ELSE sender
          END as other_user
        FROM "Message"
        WHERE sender = $1 OR recipient = $1
        ORDER BY other_user, timestamp DESC
      )
      SELECT
        rm.*,
        u.firstname,
        u.lastname,
        u.profile_picture
      FROM recent_messages rm
      JOIN "User" u ON u.username = rm.other_user
      ORDER BY rm.timestamp DESC
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows;
  },

  /**
   * Mark messages as read
   * @param {string} sender - Sender's username
   * @param {string} recipient - Recipient's username
   * @returns {Promise<boolean>} Success status
   */
  async markAsRead(sender, recipient) {
    const query = `
      UPDATE "Message"
      SET read = true
      WHERE sender = $1 AND recipient = $2 AND read = false
    `;
    
    await pool.query(query, [sender, recipient]);
    return true;
  },

  /**
   * Get unread message count for a user
   * @param {string} username - User's username
   * @returns {Promise<Object>} Count of unread messages by sender
   */
  async getUnreadCount(username) {
    const query = `
      SELECT sender, COUNT(*) as count
      FROM "Message"
      WHERE recipient = $1 AND read = false
      GROUP BY sender
    `;
    
    const result = await pool.query(query, [username]);
    
    // Convert to object with sender as key and count as value
    const counts = {};
    result.rows.forEach(row => {
      counts[row.sender] = parseInt(row.count, 10);
    });
    
    return counts;
  }
};

module.exports = Message;