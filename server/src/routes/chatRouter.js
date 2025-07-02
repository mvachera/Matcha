// const express = require('express');
// const router = express.Router();
// const Message = require('../models/message');
// const { isAuthenticated, validateBody } = require("../middlewares/authMiddleware");

// /**
//  * @route GET /chat/conversation/:username
//  * @desc Get conversation between current user and another user
//  * @access Private
//  */
// router.get('/conversation/:username', isAuthenticated, async (req, res) => {
//   try {
//     const currentUser = req.user.username; // Assuming your auth middleware sets req.user
//     const otherUser = req.params.username;
    
//     const messages = await Message.getConversation(currentUser, otherUser);
    
//     res.json({ success: true, messages });
//   } catch (error) {
//     console.error('Error fetching conversation:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// /**
//  * @route GET /chat/conversations
//  * @desc Get all conversations for the current user
//  * @access Private
//  */
// router.get('/conversations', isAuthenticated, async (req, res) => {
//   try {
//     const username = req.user.username;
    
//     const conversations = await Message.getUserConversations(username);
//     const unreadCounts = await Message.getUnreadCount(username);
    
//     // Add unread count to each conversation
//     const conversationsWithUnread = conversations.map(conv => {
//       const otherUser = conv.other_user;
//       return {
//         ...conv,
//         unread_count: unreadCounts[otherUser] || 0
//       };
//     });
    
//     res.json({ success: true, conversations: conversationsWithUnread });
//   } catch (error) {
//     console.error('Error fetching conversations:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// /**
//  * @route PUT /chat/read/:username
//  * @desc Mark messages from a specific user as read
//  * @access Private
//  */
// router.put('/read/:username', isAuthenticated, async (req, res) => {
//   try {
//     const currentUser = req.user.username;
//     const otherUser = req.params.username;
    
//     await Message.markAsRead(otherUser, currentUser);
    
//     res.json({ success: true, message: 'Messages marked as read' });
//   } catch (error) {
//     console.error('Error marking messages as read:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// module.exports = router;