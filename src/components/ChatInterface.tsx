import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';

export const ChatInterface = () => {
  const {
    currentSessionId,
    messages,
    sessions,
    isLoading,
    sendMessage,
    startNewSession,
    selectSession
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-chat-background">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={startNewSession}
        onSelectSession={selectSession}
      />
      
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome to DeepSense by DPSN</h2>
                  <p className="text-muted-foreground">Start a conversation to begin your chat session.</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-chat-ai-bubble text-chat-ai-bubble-foreground border border-border rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};