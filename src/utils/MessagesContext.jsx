import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getMessages } from './supabaseClient.jsx';
import { useAuth } from './AuthContext';

// Create context
const MessagesContext = createContext();

// Get unread conversations from localStorage
const getStoredUnreadConversations = () => {
  try {
    const stored = localStorage.getItem('unreadConversations');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse unread conversations from localStorage:', error);
    return [];
  }
};

// Save unread conversations to localStorage
const saveUnreadConversations = (conversations) => {
  try {
    localStorage.setItem('unreadConversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save unread conversations to localStorage:', error);
  }
};

export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState(() => getStoredUnreadConversations());
  const [lastChecked, setLastChecked] = useState(() => {
    try {
      // Get last checked timestamp from localStorage
      const savedTime = localStorage.getItem('messagesLastChecked');
      console.log('Loaded lastChecked from storage:', savedTime);
      
      // If no saved time exists, use a date from 30 days ago to show initial messages
      if (!savedTime) {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 30); // 30 days ago
        console.log('No saved lastChecked, using default:', defaultDate.toISOString());
        return defaultDate;
      }
      
      return new Date(savedTime);
    } catch (error) {
      console.error('Error parsing lastChecked date:', error);
      // Fallback to 30 days ago if there's an error
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() - 30);
      return fallbackDate;
    }
  });
  const [loading, setLoading] = useState(false);
  // Use a ref to avoid dependency issues in useEffect
  const unreadConversationsRef = useRef(unreadConversations);
  
  // Update ref when state changes
  useEffect(() => {
    unreadConversationsRef.current = unreadConversations;
  }, [unreadConversations]);

  // Function to check for unread messages
  const checkUnreadMessages = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setUnreadConversations([]);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch messages
      const messagesData = await getMessages(user.id);
      console.log('Fetched messages:', messagesData.length);
      console.log('Last checked time:', lastChecked.toISOString());
      
      // Find unread messages (newer than lastChecked and weren't sent by the user)
      const unreadMessages = messagesData.filter(msg => {
        const msgDate = new Date(msg.created_at);
        const isFromOther = msg.sender_id !== user.id;
        const isNewer = msgDate > lastChecked;
        
        // Debug log for message dates
        if (isFromOther) {
          console.log(`Message from ${msg.sender_id} at ${msgDate.toISOString()}, is newer: ${isNewer}`);
        }
        
        return isFromOther && isNewer;
      });
      
      console.log('Unread messages:', unreadMessages.length);
      
      // Get unique sender IDs (unique conversations with unread messages)
      const newUnreadSenders = [...new Set(unreadMessages.map(msg => msg.sender_id))];
      
      // Use the unreadConversationsRef instead of state dependency
      const currentUnread = unreadConversationsRef.current;
      
      // Combine with existing unread conversations (that haven't been marked as read)
      const allUnreadConversations = [...new Set([...currentUnread, ...newUnreadSenders])];
      console.log('All unread conversations:', allUnreadConversations);
      
      // Save to localStorage
      saveUnreadConversations(allUnreadConversations);
      
      // Update state
      setUnreadConversations(allUnreadConversations);
      
    } catch (error) {
      console.error('Error checking unread messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, lastChecked]); // Removed unreadConversations dependency

  // Update unreadCount whenever unreadConversations changes
  useEffect(() => {
    setUnreadCount(unreadConversations.length);
  }, [unreadConversations]);

  // Mark all messages as read by updating the lastChecked timestamp
  const markAllMessagesAsRead = useCallback(() => {
    const now = new Date();
    console.log('Marking all messages as read at:', now.toISOString());
    setLastChecked(now);
    setUnreadConversations([]);
    localStorage.setItem('messagesLastChecked', now.toISOString());
    saveUnreadConversations([]);
  }, []);
  
  // Mark messages from a specific sender as read
  const markConversationAsRead = useCallback((senderId) => {
    if (!senderId) return;
    
    console.log('Marking conversation as read for sender:', senderId);
    
    setUnreadConversations(prev => {
      const updated = prev.filter(id => id !== senderId);
      console.log('Updated unread conversations:', updated);
      saveUnreadConversations(updated);
      return updated;
    });
    
    // Update the last checked timestamp
    const now = new Date();
    localStorage.setItem('messagesLastChecked', now.toISOString());
    setLastChecked(now);
  }, []);

  // Force a refresh of unread messages when needed
  const refreshUnreadMessages = useCallback(() => {
    console.log('Manually refreshing unread messages');
    checkUnreadMessages();
  }, [checkUnreadMessages]);

  // Check for unread messages when user changes or component mounts
  useEffect(() => {
    let interval;
    
    if (user) {
      console.log('User logged in, checking for unread messages');
      // Initial check
      checkUnreadMessages();
      
      // Set up polling for new messages every minute (60000 ms)
      interval = setInterval(() => {
        console.log('Polling for new messages');
        checkUnreadMessages();
      }, 60000);
      console.log('Set up message polling interval');
    } else {
      // Clear unread conversations when user logs out
      setUnreadConversations([]);
      saveUnreadConversations([]);
    }
    
    // Clear interval on unmount or when dependencies change
    return () => {
      if (interval) {
        console.log('Clearing message polling interval');
        clearInterval(interval);
      }
    };
  }, [user, checkUnreadMessages]); // Removed unreadConversations from dependencies

  // The context value
  const value = {
    unreadCount,
    unreadConversations,
    checkUnreadMessages,
    markAllMessagesAsRead,
    markConversationAsRead,
    refreshUnreadMessages,
    loading
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

// Hook to use the messages context
export function useMessages() {
  return useContext(MessagesContext);
} 