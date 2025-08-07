import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { JupiterSwapWidget } from './JupiterSwapWidget';
import { useMemo } from 'react';

export interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

export interface SwapData {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  slippageBps: number;
  input_token_info: TokenInfo;
  output_token_info: TokenInfo;
}

export interface UserAction {
  action: 'get_quote' | string;
  json_data: SwapData;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  user_actions?: UserAction[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  // Check if this message has swap actions
  const swapAction = useMemo(
    () => message.user_actions?.find((action) => action.action === 'get_quote'),
    [message.user_actions]
  );

  const swapData = swapAction?.json_data as SwapData | undefined;

  // Format token amount with proper decimals
  const formatTokenAmount = (amount: string, decimals: number) => {
    return (Number(amount) / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

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
          <>
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
            
            {swapData && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Swap Details</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From:</span>
                    <span>
                      {formatTokenAmount(swapData.inAmount, swapData.input_token_info.decimals)}
                      {' '}{swapData.input_token_info.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span>
                      ~{formatTokenAmount(swapData.outAmount, swapData.output_token_info.decimals)}
                      {' '}{swapData.output_token_info.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slippage:</span>
                    <span>{(swapData.slippageBps / 100).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <JupiterSwapWidget
                    inputMint={swapData.inputMint}
                    outputMint={swapData.outputMint}
                    inAmount={swapData.inAmount}
                    outAmount={swapData.outAmount}
                    slippageBps={swapData.slippageBps}
                    inputTokenInfo={swapData.input_token_info}
                    outputTokenInfo={swapData.output_token_info}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};