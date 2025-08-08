import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ChatMessage';
import { ChatSession } from '@/components/ChatSidebar';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';

interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

interface SwapData {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps: number;
  input_token_info: TokenInfo;
  output_token_info: TokenInfo;
}

interface AIResponse {
  content: string;
  user_actions?: Array<{
    action: string;
    json_data: SwapData;
  }>;
}

const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
  SESSION_MESSAGES: 'sessionMessages',
  PREVIOUS_SESSIONS: 'previousSessions'
};

const getMockAIResponse = (userMessage: string): AIResponse => {
  // Check if user is asking about swapping tokens
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('swap') || lowerMessage.includes('exchange') || lowerMessage.includes('trade')) {
    return {
      content: `# Token Swap Suggestion 💱

I see you're interested in swapping tokens! Here's a suggested swap:

- **From**: 1 SOL
- **To**: ~100 USDC
- **Rate**: 1 SOL ≈ 100 USDC

You can review and execute this swap using the widget below. Make sure you have enough SOL in your connected wallet.`,
      user_actions: [{
        action: 'get_quote',
        json_data: {
          inputMint: 'So11111111111111111111111111111111111111112', // SOL mint address
          outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint address
          inAmount: '1000000000', // 1 SOL in lamports
          outAmount: '100000000', // ~100 USDC (6 decimals)
          slippageBps: 50, // 0.5% slippage
          input_token_info: {
            id: 'So11111111111111111111111111111111111111112',
            name: 'Wrapped SOL',
            symbol: 'SOL',
            icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            decimals: 9
          },
          output_token_info: {
            id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            name: 'USD Coin',
            symbol: 'USDC',
            icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
            decimals: 6
          }
        }
      }]
    };
  }

  const responses = [
    {
      content: `# Thank you for your message!

I understand you said: "${userMessage}"

Here's a **markdown response** to demonstrate the formatting:

## Key Points:
- This is a *mock response*
- It supports **bold text**
- And even \`code snippets\`
- Check out this [example link](https://example.com) to see how links look

### Code Example:
\`\`\`javascript
const response = "This is a mock AI response";
console.log(response);
\`\`\`

> This is a blockquote to show different formatting options. You can also include [links in blockquotes](https://example.org).

Would you like to [continue our conversation](#)?`
    },
    {
      content: `## Great question!

Your message "${userMessage}" is interesting. Let me provide a detailed response:

### Analysis:
1. **First point**: This demonstrates numbered lists with [a link](https://github.com/)
2. **Second point**: With proper formatting and [another example](https://reactjs.org/)
3. **Third point**: And clear structure

**Benefits:**
- Clean markdown rendering
- Proper typography with [styled links](https://tailwindcss.com/)
- Code syntax highlighting

\`\`\`python
def mock_response(user_input):
    # Check out [Python's website](https://www.python.org/) for more info
    return f"Processing: {user_input}"
\`\`\`

What would you like to explore next? Try visiting [MDN Web Docs](https://developer.mozilla.org/) for web development resources.`
    },
    {
      content: `# Hello there! 👋

Thanks for your message: *"${userMessage}"*

## Here's what I can help with:

### **Available Features:**
- ✅ [Markdown formatting](https://www.markdownguide.org/)
- ✅ Code highlighting with [Prism](https://prismjs.com/)  
- ✅ Lists and tables
- ✅ [Styled links](https://example.com) and images

### **Example Table:**
| Feature | Status | Description |
|---------|--------|-------------|
| Chat | ✅ Active | [Real-time messaging](https://en.wikipedia.org/wiki/Instant_messaging) |
| Sessions | ✅ Active | [Persistent conversations](https://en.wikipedia.org/wiki/Conversation) |
| Markdown | ✅ Active | [Rich text formatting](https://en.wikipedia.org/wiki/Rich_Text_Format) |

> **Note:** This is a mock response to demonstrate the chat interface capabilities. Check out [React Markdown](https://github.com/remarkjs/react-markdown) for more info.

How can I assist you further? [Click here](#) to see more examples.`
    }
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export const useChat = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { publicKey } = useWallet();

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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

      const remarks: string[] = [];
      
      // Add wallet address to remarks if wallet is connected
      if (publicKey) {
        remarks.push(`my solana wallet address is ${publicKey.toString()}`);
      }

      const response = await fetch(`${apiBaseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          session_id: currentSessionId,
          remarks:remarks,
        })
      });

      let aiMessage: Message;
      
      if (response.ok) {
        const data = await response.json();
        // const aiResponse = getMockAIResponse(content);
        aiMessage = {
          id: uuidv4(),
          content: data.response || data.message || 'Sorry, I received an empty response.',
          role: 'assistant',
          timestamp: Date.now(),
          ...(data.user_actions && { user_actions: data.user_actions })
        };
      } else {
        // Fallback to mock response if API fails
        const aiResponse = getMockAIResponse(content);
        toast({
          title: "Using Mock Response",
          description: "API endpoint not available, using mock response instead.",
          variant: "default"
        });
        aiMessage = {
          id: uuidv4(),
          content: aiResponse.content,
          role: 'assistant',
          timestamp: Date.now(),
          ...(aiResponse.user_actions && { user_actions: aiResponse.user_actions })
        };
      }

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveSessionMessages(currentSessionId, finalMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to mock response on error
      const errorResponse = getMockAIResponse(content);
      const aiMessage: Message = {
        id: uuidv4(),
        content: errorResponse.content,
        role: 'assistant',
        timestamp: Date.now(),
        ...(errorResponse.user_actions && { user_actions: errorResponse.user_actions })
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