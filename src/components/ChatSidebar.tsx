import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messageCount: number;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const ChatSidebar = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession 
}: ChatSidebarProps) => {
  return (
    <div className="w-64 bg-chat-sidebar border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessions.map((session) => (
            <Button
              key={session.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 mb-1 h-auto p-3 text-left",
                currentSessionId === session.id && "bg-accent"
              )}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 truncate">
                <div className="font-medium text-sm truncate">
                  {session.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.messageCount} messages
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};