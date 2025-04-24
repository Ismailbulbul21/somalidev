import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { sendMessage, getMessages, getProfile } from '../utils/supabaseClient.js';
import { useAuth } from '../utils/AuthContext';
import { useMessages } from '../utils/MessagesContext';
import { motion } from 'framer-motion';
import { FiSend, FiArrowLeft, FiUser, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { id: urlContactId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryContactId = queryParams.get('contact');
  const subject = queryParams.get('subject') || '';
  
  // Use contact ID from URL params or query params
  const contactId = urlContactId || queryContactId;
  
  const { user } = useAuth();
  const { markAllMessagesAsRead, markConversationAsRead, unreadConversations, refreshUnreadMessages } = useMessages();
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [profilesCache, setProfilesCache] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // Add this helper function to determine if a conversation has unread messages
  const isUnreadConversation = useCallback((contactId) => {
    return unreadConversations.includes(contactId);
  }, [unreadConversations]);

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { user, contactId });
    console.log("Current unread conversations:", unreadConversations);
  }, [user, contactId, unreadConversations]);

  // Fetch specific conversation
  const fetchConversation = useCallback(async (id, existingMessages = null, profilesCache = null) => {
    if (!user || !id) return;
    
    try {
      // Use existing messages if provided, otherwise fetch new ones
      let messagesData = existingMessages;
      if (!messagesData) {
        messagesData = await getMessages(user.id);
      }
      
      // Filter messages between current user and contact
      const relevantMessages = messagesData.filter(
        msg => (msg.sender_id === user.id && msg.recipient_id === id) || 
               (msg.sender_id === id && msg.recipient_id === user.id)
      );
      
      // Sort by date, oldest first
      relevantMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      console.log("Relevant messages:", relevantMessages);
      setMessages(relevantMessages);
      
      // Fetch contact profile if not in cache
      let contactProfileData = profilesCache ? profilesCache[id] : null;
      
      if (!contactProfileData) {
        contactProfileData = await getProfile(id);
        
        // Update profiles cache
        setProfilesCache(prev => ({
          ...prev,
          [id]: contactProfileData
        }));
      }
      
      setContactInfo(contactProfileData);
      
      // Set initial message based on subject if no messages exist
      if (relevantMessages.length === 0 && subject) {
        let initialMessage = '';
        
        if (subject === 'Job Opportunity') {
          initialMessage = `Hi, I'm interested in discussing a job opportunity with you.`;
        } else if (subject.startsWith('Skill:')) {
          const skillName = subject.substring(6).trim();
          initialMessage = `Hi, I noticed your ${skillName} skill and would like to discuss a potential collaboration.`;
        } else {
          initialMessage = `Hi, I'd like to connect with you.`;
        }
        
        setNewMessage(initialMessage);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation. Please try again later.');
    }
  }, [user, subject]);

  // Fetch all messages and build contacts list
  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log("No user logged in");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching all messages for user:", user.id);
      
      // Fetch messages
      const messagesData = await getMessages(user.id);
      console.log("All messages data:", messagesData);
      setAllMessages(messagesData);
      
      // Extract unique contacts from messages
      const contactIds = new Set();
      messagesData.forEach(msg => {
        if (msg.sender_id === user.id) {
          contactIds.add(msg.recipient_id);
        } else {
          contactIds.add(msg.sender_id);
        }
      });
      
      console.log("Contact IDs:", [...contactIds]);
      
      // Fetch contact profiles
      const contactProfiles = [];
      const profilesMap = {};
      
      // Add user's own profile to cache
      const userProfile = await getProfile(user.id);
      profilesMap[user.id] = userProfile;
      
      for (const id of contactIds) {
        try {
          const profile = await getProfile(id);
          
          // Get last message with this contact
          const contactMessages = messagesData.filter(
            msg => (msg.sender_id === user.id && msg.recipient_id === id) || 
                   (msg.sender_id === id && msg.recipient_id === user.id)
          );
          
          // Sort by date, newest first
          contactMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          const lastMessage = contactMessages[0];
          
          contactProfiles.push({
            id,
            profile,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              timestamp: lastMessage.created_at,
              isFromContact: lastMessage.sender_id === id
            } : null
          });
          
          // Add to profiles cache
          profilesMap[id] = profile;
        } catch (err) {
          console.error(`Error fetching profile for ${id}:`, err);
        }
      }
      
      // Sort contacts by latest message
      contactProfiles.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      });
      
      console.log("Contact profiles:", contactProfiles);
      setContacts(contactProfiles);
      setProfilesCache(profilesMap);
      
      if (contactId) {
        // If a contact is selected, fetch the conversation
        fetchConversation(contactId, messagesData, profilesMap);
      }
      
      return true;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contactId, fetchConversation]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log("Manually refreshing messages");
    setRefreshing(true);
    
    // Force refresh unread messages
    refreshUnreadMessages();
    
    // Refresh conversations data
    fetchAllData().then(() => {
      setRefreshing(false);
      toast.success("Messages refreshed");
    }).catch(err => {
      console.error("Error refreshing messages:", err);
      setRefreshing(false);
      toast.error("Failed to refresh messages");
    });
  }, [refreshUnreadMessages, fetchAllData]);

  // Mark messages as read when viewing a specific conversation or all messages
  useEffect(() => {
    if (user && !isInitialMount.current) {
      if (contactId) {
        // Mark only this conversation as read
        console.log(`Marking conversation as read for contact ID: ${contactId}`);
        markConversationAsRead(contactId);
      } else {
        // Mark all messages as read when viewing the messages list
        console.log("Marking all messages as read");
        markAllMessagesAsRead();
      }
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [user, contactId, markConversationAsRead, markAllMessagesAsRead]);

  // Main effect for data fetching
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !contactId) return;
    
    setSending(true);
    
    try {
      // Create message object
      const messageData = {
        sender_id: user.id,
        recipient_id: contactId,
        content: newMessage.trim(),
        created_at: new Date().toISOString()
      };
      
      await sendMessage(messageData);
      setNewMessage('');
      
      // Refresh conversation
      if (contactId) {
        fetchConversation(contactId);
      } else {
        fetchAllData();
      }
      
      toast.success('Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Get the display name for a user ID
  const getDisplayName = (userId) => {
    if (!profilesCache[userId]) return 'Loading...';
    return profilesCache[userId].full_name || 'Unknown User';
  };

  // Get the avatar URL for a user ID
  const getAvatarUrl = (userId) => {
    if (!profilesCache[userId]) return null;
    return profilesCache[userId].avatar_url;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle selecting a contact
  const handleSelectContact = (contactId) => {
    navigate(`/messages?contact=${contactId}`);
  };

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xl font-semibold mb-3"
        >
          Authentication Required
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view messages.</p>
        <button
          onClick={() => navigate('/signin')}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xl font-semibold mb-3"
        >
          Error Loading Messages
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={goBack}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  // If no contact is selected, show contacts list
  if (!contactId) {
    return (
      <div className="max-w-4xl mx-auto p-4 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h1>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh messages"
          >
            <FiRefreshCw className={`text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {contacts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No Messages Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any messages yet. Start connecting with developers to begin messaging.
            </p>
            <button
              onClick={() => navigate('/developers')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Browse Developers
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-gray-700 dark:text-gray-300">Recent Conversations</h2>
            </div>
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {contacts.map(contact => (
                <li 
                  key={contact.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    isUnreadConversation(contact.id) ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <div className="flex items-center p-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden mr-4 relative">
                      {contact.profile?.avatar_url ? (
                        <img 
                          src={contact.profile.avatar_url} 
                          alt={contact.profile.full_name || 'Contact'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold">
                          {contact.profile?.full_name?.[0] || <FiUser />}
                        </div>
                      )}
                      
                      {/* Unread indicator */}
                      {isUnreadConversation(contact.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        isUnreadConversation(contact.id) 
                          ? 'text-purple-700 dark:text-purple-400 font-semibold' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {contact.profile?.full_name || 'Unknown User'}
                      </h3>
                      
                      {contact.lastMessage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {contact.lastMessage.isFromContact ? '' : 'You: '}
                          {contact.lastMessage.content}
                        </p>
                      )}
                    </div>
                    
                    {contact.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(contact.lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      {/* Contact header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/messages')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FiArrowLeft className="text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
            {contactInfo?.avatar_url ? (
              <img 
                src={contactInfo.avatar_url} 
                alt={contactInfo.full_name || 'Contact'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-600">
                {contactInfo?.full_name?.[0] || '?'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {contactInfo?.full_name || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contactInfo?.title || 'Developer'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 h-[60vh] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-[80%]">
                  {msg.sender_id !== user.id && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-2 overflow-hidden">
                      {getAvatarUrl(msg.sender_id) ? (
                        <img 
                          src={getAvatarUrl(msg.sender_id)} 
                          alt={getDisplayName(msg.sender_id)} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 flex items-center justify-center h-full">
                          {getDisplayName(msg.sender_id)[0] || '?'}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`
                      rounded-lg px-4 py-2 break-words
                      ${msg.sender_id === user.id ? 
                        'bg-purple-600 text-white ml-2' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }
                    `}
                  >
                    <p>{msg.content}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        msg.sender_id === user.id ? 
                          'text-purple-200' : 
                          'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {msg.sender_id === user.id && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 ml-2 overflow-hidden">
                      {getAvatarUrl(msg.sender_id) ? (
                        <img 
                          src={getAvatarUrl(msg.sender_id)} 
                          alt={getDisplayName(msg.sender_id)} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600 flex items-center justify-center h-full">
                          {getDisplayName(msg.sender_id)[0] || '?'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Type your message..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className={`
            px-4 rounded-lg bg-purple-600 text-white flex items-center justify-center
            ${sending || !newMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}
            transition-colors
          `}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend />
          )}
        </button>
      </form>
    </div>
  );
};

export default Messages; 