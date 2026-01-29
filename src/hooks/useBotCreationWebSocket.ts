import { useEffect, useRef, useState, useCallback } from 'react';

export interface BotConfig {
  company_overview: string;
  product_features: string;
  customer_faqs: string;
  conversation_style: {
    chat_length: string;
    chat_guidelines: string;
    voice_length: string;
    voice_guidelines: string;
  };
  purpose_category: string;
  persona: string;
  tone_of_voice: string;
  agent_name: string;
}

export interface StatusDetails {
  completed?: number;
  total?: number;
  document?: string;
}

export interface ProgressData {
  progress: number;
  message: string;
  stageDisplay: string;
  stageIcon: string;
  stage: string;
  details?: StatusDetails;
}

interface WebSocketMessage {
  type?: string;
  progress?: number;
  message?: string;
  stage?: string;
  stage_display?: string;
  stage_icon?: string;
  details?: StatusDetails;
  complete?: boolean;
  error?: string;
}

export const useBotCreationWebSocket = (
  botId: string | null,
  ticket: string | null,
  botConfig: BotConfig | null,
  onProgress: (data: ProgressData) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const configSentRef = useRef(false);

  // Memoize callbacks to avoid reconnection loops
  const handleProgress = useCallback(onProgress, []);
  const handleComplete = useCallback(onComplete, []);
  const handleError = useCallback(onError, []);

  useEffect(() => {
    if (!botId || !ticket) return;

    // Reset config sent flag on new connection
    configSentRef.current = false;

    const wsUrl = `wss://dev-api-iform.impactodigifin.xyz/ws/chatbot/create/${botId}?ticket=${ticket}`;
    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        // Handle status updates
        if (data.type === 'status_update' && data.progress !== undefined) {
          handleProgress({
            progress: data.progress,
            message: data.message || 'Processing...',
            stageDisplay: data.stage_display || 'Processing',
            stageIcon: data.stage_icon || '⏳',
            stage: data.stage || '',
            details: data.details,
          });

          // Send bot_config after receiving "initialized" stage
          if (data.stage === 'initialized' && !configSentRef.current && botConfig) {
            console.log('Sending bot_config after initialized status');
            const configMessage = {
              type: 'bot_config',
              timestamp: new Date().toISOString(),
              config: botConfig,
            };
            ws.send(JSON.stringify(configMessage));
            configSentRef.current = true;
            console.log('bot_config sent:', configMessage);
          }
        }

        // Check for completion - backend sends stage: "completed" not complete: true
        if (data.complete || data.stage === 'completed') {
          handleComplete();
        }
        if (data.error) {
          handleError(data.error);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      handleError('WebSocket connection failed');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [botId, ticket, botConfig, handleProgress, handleComplete, handleError]);

  return { isConnected, ws: wsRef.current };
};
