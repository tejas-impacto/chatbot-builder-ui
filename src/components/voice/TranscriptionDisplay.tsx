import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptionEntry, ResponseEntry, VoiceState } from '@/types/voice';

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionEntry[];
  responses: ResponseEntry[];
  currentState: VoiceState | 'idle';
  className?: string;
}

type ConversationItem = {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  isFinal?: boolean;
};

export const TranscriptionDisplay = ({
  transcriptions,
  responses,
  currentState,
  className,
}: TranscriptionDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine and sort by timestamp
  const conversation: ConversationItem[] = [
    ...transcriptions.filter(t => t.isFinal).map(t => ({
      id: t.id,
      text: t.text,
      timestamp: t.timestamp,
      sender: 'user' as const,
      isFinal: t.isFinal,
    })),
    ...responses.map(r => ({
      id: r.id,
      text: r.text,
      timestamp: r.timestamp,
      sender: 'bot' as const,
    })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Get current interim transcription
  const interimTranscription = transcriptions.find(t => !t.isFinal);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation.length, interimTranscription?.text]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isEmpty = conversation.length === 0 && !interimTranscription;

  return (
    <div
      ref={scrollRef}
      className={cn('flex-1 overflow-y-auto p-4 space-y-4', className)}
    >
      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {currentState === 'idle'
              ? 'Click the call button to start a voice conversation'
              : 'Listening... Start speaking'}
          </p>
        </div>
      )}

      {conversation.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-3',
            item.sender === 'user' && 'flex-row-reverse'
          )}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              item.sender === 'user' ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            {item.sender === 'user' ? (
              <User className="w-4 h-4 text-primary" />
            ) : (
              <Bot className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className={cn('max-w-[75%]', item.sender === 'user' && 'text-right')}>
            <div
              className={cn(
                'p-3 rounded-2xl inline-block',
                item.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{item.text}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1 px-1">
              {formatTime(item.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {/* Interim transcription (while speaking) */}
      {interimTranscription && (
        <div className="flex items-start gap-3 flex-row-reverse opacity-70">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="max-w-[75%] text-right">
            <div className="p-3 rounded-2xl rounded-br-md bg-primary/60 text-primary-foreground inline-block">
              <p className="text-sm italic">{interimTranscription.text}...</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {currentState === 'VOICE_STATE_PROCESSING' && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="p-3 rounded-2xl rounded-bl-md bg-muted">
            <div className="flex gap-1.5">
              <span
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
