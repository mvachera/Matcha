import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket, Message, TypingIndicator, MessageData } from "@/hooks/use-socket";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  typingUsers: Record<string, boolean>;
  connectedUsers: string[];
  error: string | null;
  sendMessage: (data: MessageData) => void;
  sendTypingIndicator: (recipientId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socketData = useSocket();
  
  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  
  return context;
};