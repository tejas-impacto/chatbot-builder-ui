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
  lead_capture?: {
    is_lead_capture_required: boolean;
  };
  configuration?: {
    company_overview?: string;
    product_features?: string;
    customer_faqs?: string;
    service_guidelines?: string;
  };
}

export interface StatusDetails {
  completed?: number;
  total?: number;
  document?: string;
}

export interface ClarificationRequest {
  questions: string[];
  context?: string;
  timestamp?: string;
}

export interface ProgressData {
  progress: number;
  message: string;
  stageDisplay: string;
  stageIcon: string;
  stage: string;
  details?: StatusDetails;
}

export interface CompletionData {
  chatbot_id?: string;
  message?: string;
  summary?: {
    documents_processed?: number;
    entities_extracted?: number;
    embeddings_created?: number;
  };
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
  // Error fields
  error?: string;
  code?: string;
  // Clarification request fields
  questions?: string[];
  context?: string;
  timestamp?: string;
  // Completion fields
  chatbot_id?: string;
  summary?: {
    documents_processed?: number;
    entities_extracted?: number;
    embeddings_created?: number;
  };
}

export const useBotCreationWebSocket = (
  botId: string | null,
  ticket: string | null,
  botConfig: BotConfig | null,
  onProgress: (data: ProgressData) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  onClarificationRequest?: (data: ClarificationRequest) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const configSentRef = useRef(false);
  const completedRef = useRef(false); // Track if completion was received

  // Use refs to store the latest callbacks to avoid reconnection loops
  // while still having access to the most recent callback functions
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onClarificationRequestRef = useRef(onClarificationRequest);

  // Update refs when callbacks change
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onClarificationRequestRef.current = onClarificationRequest;
  }, [onClarificationRequest]);

  useEffect(() => {
    if (!botId || !ticket) return;

    // Reset flags on new connection
    configSentRef.current = false;
    completedRef.current = false;

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
        console.log('WebSocket message received:', data);
        console.log('Message type:', data.type);

        // Handle clarification request FIRST (before status updates)
        if (data.type === 'clarification_request') {
          console.log('=== CLARIFICATION REQUEST DETECTED ===');
          console.log('Questions:', data.questions);
          console.log('Context:', data.context);
          if (data.questions && data.questions.length > 0) {
            console.log('Calling onClarificationRequestRef.current');
            onClarificationRequestRef.current?.({
              questions: data.questions,
              context: data.context,
              timestamp: data.timestamp,
            });
          } else {
            console.warn('Clarification request received but no questions array');
          }
        }

        // Handle status updates
        if (data.type === 'status_update' && data.progress !== undefined) {
          onProgressRef.current({
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

        // Handle completion message
        if (data.type === 'completion') {
          console.log('Completion received:', data);
          completedRef.current = true; // Mark as completed
          onCompleteRef.current();
        }

        // Handle error message (but ignore errors after completion)
        if (data.type === 'error' && data.message) {
          if (completedRef.current) {
            // Ignore errors that come after successful completion
            console.log('Ignoring error after completion:', data.message);
          } else {
            console.error('Error received:', data);
            onErrorRef.current(data.message);
          }
        }

        // Handle pong (keep-alive response)
        if (data.type === 'pong') {
          console.log('Pong received');
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onErrorRef.current('WebSocket connection failed');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
    };

    // Set up ping interval for keep-alive (every 30 seconds)
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
        console.log('Ping sent');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [botId, ticket, botConfig]);

  // Function to send clarification response
  const sendClarificationResponse = useCallback((answers: Record<string, string>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const response = {
        type: 'clarification_response',
        timestamp: new Date().toISOString(),
        answers,
      };
      wsRef.current.send(JSON.stringify(response));
      console.log('Clarification response sent:', response);
    } else {
      console.error('WebSocket not connected, cannot send clarification response');
    }
  }, []);

  return { isConnected, ws: wsRef.current, sendClarificationResponse };
};
