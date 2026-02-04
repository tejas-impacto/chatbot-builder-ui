import { Phone, PhoneOff, Mic, MicOff, Hand, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  isCallActive: boolean;
  isMuted: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onToggleCall: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  className?: string;
}

export const VoiceControls = ({
  isCallActive,
  isMuted,
  isConnecting,
  isSpeaking,
  onToggleCall,
  onToggleMute,
  onInterrupt,
  className,
}: VoiceControlsProps) => {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Interrupt button (only when AI is speaking) */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'rounded-full w-12 h-12 transition-all',
          isSpeaking
            ? 'border-orange-500 text-orange-500 hover:bg-orange-500/10'
            : 'opacity-50 cursor-not-allowed'
        )}
        onClick={onInterrupt}
        disabled={!isSpeaking}
        title="Interrupt AI"
      >
        <Hand className="w-5 h-5" />
      </Button>

      {/* Main call button */}
      <Button
        onClick={onToggleCall}
        size="icon"
        disabled={isConnecting}
        className={cn(
          'rounded-full w-16 h-16 transition-all shadow-lg',
          isCallActive
            ? 'bg-destructive hover:bg-destructive/90'
            : 'bg-green-600 hover:bg-green-700',
          isConnecting && 'animate-pulse'
        )}
      >
        {isConnecting ? (
          <Loader2 className="w-7 h-7 animate-spin" />
        ) : isCallActive ? (
          <PhoneOff className="w-7 h-7" />
        ) : (
          <Phone className="w-7 h-7" />
        )}
      </Button>

      {/* Mute button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'rounded-full w-12 h-12 transition-all',
          isMuted && 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20'
        )}
        onClick={onToggleMute}
        disabled={!isCallActive}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};

export default VoiceControls;
