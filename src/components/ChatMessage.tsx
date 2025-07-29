import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-3 shadow-sm",
        isUser 
          ? "bg-chat-user-bubble text-chat-user-bubble-foreground" 
          : "bg-chat-ai-bubble text-chat-ai-bubble-foreground border border-border"
      )}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-chat-ai-bubble-foreground prose-p:text-chat-ai-bubble-foreground prose-strong:text-chat-ai-bubble-foreground prose-code:text-chat-ai-bubble-foreground prose-pre:bg-muted prose-pre:text-muted-foreground">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, href, children, ...props}) => (
                  <span className="inline-flex items-baseline">
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                      {...props}
                    >
                      {children}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </span>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};