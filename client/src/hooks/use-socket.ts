import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from "@/context/auth-context";
import { initializeSocket, disconnectSocket, getSocket } from '../services/socket';
import { toast } from './use-toast';
export type MessageData = {
  recipientUsername: string;
  message: string;
  conversationId?: string;
};

export type Message = {
  senderUsername: string;
  recipientUsername: string;
  message: string;
  conversationId?: string;
  timestamp: Date;
  delivered?: boolean;
  id?: string; // Add unique ID to help with duplication detection
};

export type TypingIndicator = {
  senderUsername: string;
  isTyping: boolean;
};

// Helper to generate a message ID if needed
const generateMessageId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useSocket = () => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of message IDs we've seen to prevent duplicates
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Initialize socket when token changes
  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }
    
    try {
      const socketInstance = initializeSocket(token);
      setSocket(socketInstance);
      
      return () => {
        disconnectSocket();
      };
    } catch (err) {
      setError('Failed to initialize socket connection');
      console.error('Socket initialization error:', err);
    }
  }, [token]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;
    
    const onConnect = () => {
      console.log("Socket connected with ID:", socket.id);
      setIsConnected(true);
      setError(null);
    };
    
    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        setError('You were disconnected by the server');
      } else if (reason === 'transport close') {
        setError('Connection lost. Attempting to reconnect...');
      }
    };
    
    const onConnectError = (err: Error) => {
      console.error("Socket connection error:", err);
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
    };
    
    const onNewMessage = (message: Message) => {
      console.log('New message received:', message);
      toast({
        title: 'New message',
        description: `From: ${message.senderUsername} - ${message.message}`,
        onClick: () => {
          // alert(`Message from ${message.senderUsername}: ${message.message}`);
          window.location.href = `/user/${message.senderUsername}?chat=true`;
        }
      });

      // Generate a unique ID for this message if it doesn't have one
      const messageId = message.id || 
        `${message.senderUsername}-${message.recipientUsername}-${message.timestamp}-${generateMessageId()}`;
      
      // Check if we've already processed this message
      if (messageIdsRef.current.has(messageId)) {
        console.log("Duplicate message detected, not adding:", message);
        return;
      }
      
      // Mark this message as processed
      messageIdsRef.current.add(messageId);
      
      // Add the message to our state
      setMessages(prev => [...prev, { ...message, id: messageId }]);
    };
    
    const onUserTyping = (data: TypingIndicator) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.senderUsername]: data.isTyping
      }));
    };
    
    const onConnectedUsers = (users: string[]) => {
      console.log("Connected users updated:", users);
      setConnectedUsers(users);
    };
    
    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('connectedUsers', onConnectedUsers);
    
    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('connectedUsers', onConnectedUsers);
    };
  }, [socket]);

  // Optimistic UI update for sent messages
  const sendMessage = useCallback((data: MessageData): void => {
    if (!socket || !isConnected || !user) {
      setError('Cannot send message: Not connected to server');
      return;
    }
    
    console.log("Sending message:", data);
    
    // Create a temporary optimistic message
    const tempMessageId = generateMessageId();
    const optimisticMessage: Message = {
      id: tempMessageId,
      senderUsername: user.username,
      recipientUsername: data.recipientUsername,
      message: data.message,
      conversationId: data.conversationId,
      timestamp: new Date(),
      delivered: false, // Will be updated when confirmation comes back
    };
    
    // Add to message set to prevent duplicates when the server sends it back
    messageIdsRef.current.add(tempMessageId);
    
    // Update UI immediately with optimistic message
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Send the actual message to the server
    socket.emit('sendMessage', data);
  }, [socket, isConnected, user]);

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = useCallback((recipientUsername: string, isTyping: boolean): void => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing', { recipientUsername, isTyping });
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    connectedUsers,
    error,
    sendMessage,
    sendTypingIndicator
  };
};

// FRONTEND CO