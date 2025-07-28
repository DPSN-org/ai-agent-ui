import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ChatMessage';
import { ChatSession } from '@/components/ChatSidebar';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
  SESSION_MESSAGES: 'sessionMessages',
  PREVIOUS_SESSIONS: 'previousSessions'
};

const getMockAIResponse = (userMessage: string): string => {
  const responses = [
    `# Thank you for your message!

I understand you said: "${userMessage}"

Here's a **markdown response** to demonstrate the formatting:

## Key Points:
- This is a *mock response*
- It supports **bold text**
- And even \`code snippets\`

### Code Example:
\`\`\`javascript
const response = "This is a mock AI response";
console.log(response);
\`\`\`

> This is a blockquote to show different formatting options.

Would you like to continue our conversation?`,
    
    `## Great question!

Your message "${userMessage}" is interesting. Let me provide a detailed response:

### Analysis:
1. **First point**: This demonstrates numbered lists
2. **Second point**: With proper formatting
3. **Third point**: And clear structure

**Benefits:**
- Clean markdown rendering
- Proper typography
- Code syntax highlighting

\`\`\`python
def mock_response(user_input):
    return f"Processing: {user_input}"
\`\`\`

What would you like to explore next?`,

    `# Hello there! 👋

Thanks for your message: *"${userMessage}"*

## Here's what I can help with:

### **Available Features:**
- ✅ Markdown formatting
- ✅ Code highlighting  
- ✅ Lists and tables
- ✅ Links and images

### **Example Table:**
| Feature | Status | Description |
|---------|--------|-------------|
| Chat | ✅ Active | Real-time messaging |
| Sessions | ✅ Active | Persistent conversations |
| Markdown | ✅ Active | Rich text formatting |

> **Note:** This is a mock response to demonstrate the chat interface capabilities.

How can I assist you further?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export const useChat = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Save session before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveSessionMessages(currentSessionId, messages);
        const sessionTitle = messages[0]?.content?.slice(0, 50) + '...' || 'New Chat';
        const sessionData: ChatSession = {
          id: currentSessionId,
          title: sessionTitle,
          timestamp: Date.now(),
          messageCount: messages.length
        };
        
        setSessions(prevSessions => {
          const existingIndex = prevSessions.findIndex(s => s.id === currentSessionId);
          const updatedSessions = [...prevSessions];
          
          if (existingIndex >= 0) {
            updatedSessions[existingIndex] = sessionData;
          } else if (messages.length > 0) {
            updatedSessions.unshift(sessionData);
          }
          
          // Only save non-empty sessions
          const nonEmptySessions = updatedSessions.filter(s => s.messageCount > 0);
          localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(nonEmptySessions));
          return nonEmptySessions;
        });
      } else {
        // Remove empty session from the list
        setSessions(prevSessions => {
          const filtered = prevSessions.filter(s => s.id !== currentSessionId);
          if (filtered.length !== prevSessions.length) {
            localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(filtered));
            return filtered;
          }
          return prevSessions;
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSessionId, messages]);

  // Initialize session on mount
  useEffect(() => {
    // Always start a new session when the page loads
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    
    // Load previous sessions
    loadPreviousSessions();
  }, []);

  const initializeSession = () => {
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    setMessages([]);
  };

  const loadSessionMessages = (sessionId: string) => {
    const stored = localStorage.getItem(`${STORAGE_KEYS.SESSION_MESSAGES}_${sessionId}`);
    if (stored) {
      try {
        const parsedMessages = JSON.parse(stored);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading session messages:', error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  const loadPreviousSessions = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PREVIOUS_SESSIONS);
    if (stored) {
      try {
        const parsedSessions = JSON.parse(stored);
        setSessions(parsedSessions);
      } catch (error) {
        console.error('Error loading previous sessions:', error);
        setSessions([]);
      }
    }
  };

  const saveSessionMessages = useCallback((sessionId: string, sessionMessages: Message[]) => {
    localStorage.setItem(`${STORAGE_KEYS.SESSION_MESSAGES}_${sessionId}`, JSON.stringify(sessionMessages));
  }, []);

  const archiveCurrentSession = useCallback(() => {
    // Don't archive empty sessions
    if (messages.length === 0) {
      // Remove the session from the list if it exists
      setSessions(prevSessions => {
        const filtered = prevSessions.filter(s => s.id !== currentSessionId);
        if (filtered.length !== prevSessions.length) {
          localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(filtered));
          return filtered;
        }
        return prevSessions;
      });
      return;
    }
    
    const sessionTitle = messages[0]?.content?.slice(0, 50) + '...' || 'New Chat';
    const sessionData: ChatSession = {
      id: currentSessionId,
      title: sessionTitle,
      timestamp: Date.now(),
      messageCount: messages.length
    };

    // Check if session already exists
    const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
    let updatedSessions;
    
    if (sessionIndex >= 0) {
      // Update existing session
      updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = sessionData;
    } else {
      // Add new session only if it has messages
      updatedSessions = [sessionData, ...sessions];
    }
    
    setSessions(updatedSessions);
    localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(updatedSessions));
  }, [currentSessionId, messages, sessions]);

  const startNewSession = useCallback(() => {
    // Archive current session if it has messages
    if (messages.length > 0) {
      archiveCurrentSession();
    } else {
      // Clean up empty session
      setSessions(prevSessions => {
        const filtered = prevSessions.filter(s => s.id !== currentSessionId);
        if (filtered.length !== prevSessions.length) {
          localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(filtered));
          return filtered;
        }
        return prevSessions;
      });
    }
    
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    // Update the current session ID
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    
    // Note: We don't add the new session to the list until it has messages
  }, [archiveCurrentSession, messages, currentSessionId]);

  const selectSession = useCallback((sessionId: string) => {
    if (sessionId === currentSessionId) return;
    
    // Only archive if the current session has messages and exists in the sessions list
    const currentSessionExists = sessions.some(s => s.id === currentSessionId);
    if (messages.length > 0 && currentSessionExists) {
      // Update the current session before switching
      const updatedSessions = sessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, messageCount: messages.length }
          : session
      );
      setSessions(updatedSessions);
      localStorage.setItem(STORAGE_KEYS.PREVIOUS_SESSIONS, JSON.stringify(updatedSessions));
    }
    
    // Switch to the selected session
    setCurrentSessionId(sessionId);
    loadSessionMessages(sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }, [currentSessionId, messages, sessions]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveSessionMessages(currentSessionId, updatedMessages);
    setIsLoading(true);

    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          session_id: currentSessionId
        })
      });

      let aiResponseContent: string;
      
      if (response.ok) {
        const data = await response.json();
        aiResponseContent = data.response || data.message || 'Sorry, I received an empty response.';
      } else {
        // Fallback to mock response if API fails
        aiResponseContent = getMockAIResponse(content);
        toast({
          title: "Using Mock Response",
          description: "API endpoint not available, using mock response instead.",
          variant: "default"
        });
      }

      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveSessionMessages(currentSessionId, finalMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to mock response on error
      const aiMessage: Message = {
        id: uuidv4(),
        content: getMockAIResponse(content),
        role: 'assistant',
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveSessionMessages(currentSessionId, finalMessages);
      
      toast({
        title: "Connection Error",
        description: "Using mock response. Check your network connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSessionId, saveSessionMessages, toast]);

  return {
    currentSessionId,
    messages,
    sessions,
    isLoading,
    sendMessage,
    startNewSession,
    selectSession
  };
};