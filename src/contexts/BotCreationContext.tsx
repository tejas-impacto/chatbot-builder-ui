import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelBotCreation, deleteBot } from '@/lib/botApi';
import { useToast } from '@/hooks/use-toast';
import type { BotConfig, StatusDetails, ClarificationRequest, ProgressData } from '@/hooks/useBotCreationWebSocket';
import BotCreationFloatingWidget from '@/components/bot-creation/BotCreationFloatingWidget';

export type BotCreationStatus = 'idle' | 'connecting' | 'in_progress' | 'clarification_needed' | 'completed' | 'error';

export interface BotCreationSession {
  botId: string;
  ticket: string;
  sessionId: string;
  agentName: string;
  tenantId: string;
  botConfig: BotConfig | null;
  documentsUploaded: number;
}

interface BotCreationState {
  status: BotCreationStatus;
  isMinimized: boolean;
  isConnected: boolean;
  progress: number;
  currentMessage: string;
  stageDisplay: string;
  stageIcon: string;
  statusDetails: StatusDetails | null;
  error: string | null;
  session: BotCreationSession | null;
  clarificationRequest: ClarificationRequest | null;
  isCancelling: boolean;
  isSubmittingAnswer: boolean;
}

interface BotCreationActions {
  startSession: (params: BotCreationSession) => void;
  minimize: () => void;
  expand: () => void;
  setExpanded: () => void;
  dismiss: () => void;
  cancelSession: () => Promise<void>;
  sendClarificationResponse: (answers: Record<string, string>) => void;
}

type BotCreationContextType = BotCreationState & BotCreationActions;

const BotCreationContext = createContext<BotCreationContextType | null>(null);

export const useBotCreation = (): BotCreationContextType => {
  const ctx = useContext(BotCreationContext);
  if (!ctx) {
    throw new Error('useBotCreation must be used within a BotCreationProvider');
  }
  return ctx;
};

const initialState: BotCreationState = {
  status: 'idle',
  isMinimized: false,
  isConnected: false,
  progress: 0,
  currentMessage: 'Initializing...',
  stageDisplay: 'Getting Started',
  stageIcon: '🚀',
  statusDetails: null,
  error: null,
  session: null,
  clarificationRequest: null,
  isCancelling: false,
  isSubmittingAnswer: false,
};

export const BotCreationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [state, setState] = useState<BotCreationState>(initialState);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const configSentRef = useRef(false);
  const completedRef = useRef(false);

  const cleanupWebSocket = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    cleanupWebSocket();
    configSentRef.current = false;
    completedRef.current = false;
    setState(initialState);
  }, [cleanupWebSocket]);

  const startSession = useCallback((params: BotCreationSession) => {
    // Reset any previous session
    cleanupWebSocket();
    configSentRef.current = false;
    completedRef.current = false;

    setState({
      ...initialState,
      status: 'connecting',
      session: params,
    });

    const wsUrl = `wss://dev-api-iform.impactodigifin.xyz/ws/chatbot/create/${params.botId}?ticket=${params.ticket}`;
    console.log('BotCreationContext: Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('BotCreationContext: WebSocket connected');
      setState(prev => ({ ...prev, status: 'in_progress', isConnected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('BotCreationContext: WebSocket message:', data);

        // Handle clarification request
        if (data.type === 'clarification_request') {
          if (data.questions && data.questions.length > 0) {
            setState(prev => ({
              ...prev,
              status: 'clarification_needed',
              clarificationRequest: {
                questions: data.questions,
                context: data.context,
                timestamp: data.timestamp,
              },
              stageDisplay: 'Clarification Needed',
              stageIcon: '💬',
              currentMessage: 'Please answer the questions to continue',
            }));
          }
        }

        // Handle status updates
        if (data.type === 'status_update' && data.progress !== undefined) {
          setState(prev => ({
            ...prev,
            status: prev.status === 'clarification_needed' ? prev.status : 'in_progress',
            progress: data.progress,
            currentMessage: data.message || 'Processing...',
            stageDisplay: data.stage_display || 'Processing',
            stageIcon: data.stage_icon || '⏳',
            statusDetails: data.details || null,
          }));

          // Send bot_config after "initialized" stage
          if (data.stage === 'initialized' && !configSentRef.current && params.botConfig) {
            console.log('BotCreationContext: Sending bot_config');
            const configMessage = {
              type: 'bot_config',
              timestamp: new Date().toISOString(),
              config: params.botConfig,
            };
            ws.send(JSON.stringify(configMessage));
            configSentRef.current = true;
          }
        }

        // Handle completion
        if (data.type === 'completion') {
          console.log('BotCreationContext: Completion received');
          completedRef.current = true;
          setState(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
            currentMessage: 'Complete!',
            stageDisplay: 'All Done!',
            stageIcon: '🎉',
          }));
        }

        // Handle error (ignore after completion)
        if (data.type === 'error' && data.message) {
          if (completedRef.current) {
            console.log('BotCreationContext: Ignoring error after completion:', data.message);
          } else {
            setState(prev => ({
              ...prev,
              status: 'error',
              error: data.message,
            }));
            toast({
              title: 'Error',
              description: data.message,
              variant: 'destructive',
            });
          }
        }

        // Handle pong
        if (data.type === 'pong') {
          console.log('BotCreationContext: Pong received');
        }
      } catch (e) {
        console.error('BotCreationContext: Failed to parse message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('BotCreationContext: WebSocket error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'WebSocket connection failed',
        isConnected: false,
      }));
    };

    ws.onclose = (event) => {
      console.log('BotCreationContext: WebSocket closed:', event.code, event.reason);
      setState(prev => ({ ...prev, isConnected: false }));
    };

    // Ping every 30s
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }, [cleanupWebSocket, toast]);

  const minimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: true }));
  }, []);

  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false }));
    navigate('/bot-creation-progress');
  }, [navigate]);

  const setExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  const dismiss = useCallback(() => {
    resetState();
  }, [resetState]);

  const cancelSession = useCallback(async () => {
    const session = state.session;
    if (!session?.botId) {
      resetState();
      navigate('/dashboard');
      return;
    }

    setState(prev => ({ ...prev, isCancelling: true }));
    try {
      await cancelBotCreation(session.botId);
      if (session.tenantId) {
        await deleteBot(session.botId, session.tenantId);
      }
      toast({
        title: 'Cancelled',
        description: 'Bot creation has been cancelled and bot deleted.',
      });
    } catch (e) {
      console.error('Failed to cancel:', e);
    }
    resetState();
    navigate('/dashboard');
  }, [state.session, resetState, navigate, toast]);

  const sendClarificationResponse = useCallback((answers: Record<string, string>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const response = {
        type: 'clarification_response',
        timestamp: new Date().toISOString(),
        answers,
      };
      wsRef.current.send(JSON.stringify(response));
      console.log('BotCreationContext: Clarification response sent:', response);

      setState(prev => ({
        ...prev,
        status: 'in_progress',
        clarificationRequest: null,
        isSubmittingAnswer: false,
        stageDisplay: 'Processing...',
        stageIcon: '⏳',
        currentMessage: 'Processing your answers...',
      }));
    } else {
      console.error('BotCreationContext: WebSocket not connected');
    }
  }, []);

  const isActive = state.status !== 'idle';

  const contextValue: BotCreationContextType = {
    ...state,
    startSession,
    minimize,
    expand,
    setExpanded,
    dismiss,
    cancelSession,
    sendClarificationResponse,
  };

  return (
    <BotCreationContext.Provider value={contextValue}>
      {children}
      {isActive && state.isMinimized && <BotCreationFloatingWidget />}
    </BotCreationContext.Provider>
  );
};
