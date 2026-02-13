import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useBotCreation } from '@/contexts/BotCreationContext';
import { Progress } from '@/components/ui/progress';

const BotCreationFloatingWidget = () => {
  const { status, progress, stageDisplay, stageIcon, session, expand, dismiss } = useBotCreation();

  const agentName = session?.agentName || 'AI Agent';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 bg-card rounded-2xl border border-border shadow-xl animate-fade-in cursor-pointer"
      onClick={expand}
    >
      <div className="p-4">
        {/* In Progress / Connecting */}
        {(status === 'connecting' || status === 'in_progress') && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{stageIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{agentName}</p>
                <p className="text-xs text-muted-foreground truncate">{stageDisplay}</p>
              </div>
              <span className="text-xs font-medium text-primary flex-shrink-0">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Clarification Needed */}
        {status === 'clarification_needed' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <span className="text-2xl">💬</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{agentName}</p>
                <p className="text-xs text-amber-500 font-medium">Action required</p>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Completed */}
        {status === 'completed' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agentName}</p>
              <p className="text-xs text-green-500 font-medium">Bot created!</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agentName}</p>
              <p className="text-xs text-destructive font-medium">Creation failed</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Click hint */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted-foreground text-center">Click to view details</p>
      </div>
    </div>
  );
};

export default BotCreationFloatingWidget;
