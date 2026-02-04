import { useEffect, useRef, useState, useCallback } from 'react';
import { getVoiceSessionTicket, buildVoiceWebSocketUrl } from '@/lib/voiceApi';
import { AudioRecorder, AudioPlayer, calculateAudioLevel } from '@/utils/audioUtils';
import type {
  VoiceChatState,
  VoiceState,
  TranscriptionEntry,
  ResponseEntry,
  IncomingVoiceMessage,
} from '@/types/voice';

interface UseVoiceChatOptions {
  tenantId: string;
  botId: string;
  botName: string;
  voice?: string;
  language?: string;
  onError?: (error: string) => void;
}

interface UseVoiceChatReturn {
  state: VoiceChatState;
  transcriptions: TranscriptionEntry[];
  responses: ResponseEntry[];
  audioLevel: number;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  interrupt: () => void;
  isConnecting: boolean;
}

export const useVoiceChat = ({
  tenantId,
  botId,
  botName,
  voice = 'alloy',
  language = 'en',
  onError,
}: UseVoiceChatOptions): UseVoiceChatReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const leadIdRef = useRef<string | null>(null);
  const sessionReadyRef = useRef(false); // Track if session is ready for audio

  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isCallActive: false,
    isMuted: false,
    currentState: 'idle',
    sessionId: null,
    error: null,
  });

  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [responses, setResponses] = useState<ResponseEntry[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    // Debug: Log the type of data received
    console.log('WebSocket message received, type:', typeof event.data,
      event.data instanceof ArrayBuffer ? 'ArrayBuffer' :
      event.data instanceof Blob ? 'Blob' :
      typeof event.data === 'string' ? 'string' : 'unknown',
      'size:', event.data instanceof ArrayBuffer ? event.data.byteLength :
              event.data instanceof Blob ? event.data.size :
              typeof event.data === 'string' ? event.data.length : 'N/A');

    // Handle binary audio data from server (ArrayBuffer since we set binaryType)
    if (event.data instanceof ArrayBuffer) {
      console.log('Received audio ArrayBuffer, size:', event.data.byteLength);

      // Initialize AudioPlayer if not already done
      if (!audioPlayerRef.current) {
        console.log('AudioPlayer not initialized yet, creating now...');
        const player = new AudioPlayer();
        player.setCallbacks(
          () => setState(prev => ({ ...prev, currentState: 'VOICE_STATE_SPEAKING' })),
          () => {
            setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'PLAYBACK_COMPLETE' }));
            }
          }
        );
        audioPlayerRef.current = player;
      }

      audioPlayerRef.current.playAudioData(event.data);
      return;
    }

    // Handle binary audio data from server (Blob fallback)
    if (event.data instanceof Blob) {
      console.log('Received audio Blob, size:', event.data.size);

      // Initialize AudioPlayer if not already done (audio might arrive before session_ready)
      if (!audioPlayerRef.current) {
        console.log('AudioPlayer not initialized yet, creating now...');
        const player = new AudioPlayer();
        player.setCallbacks(
          () => setState(prev => ({ ...prev, currentState: 'VOICE_STATE_SPEAKING' })),
          () => {
            setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'PLAYBACK_COMPLETE' }));
            }
          }
        );
        audioPlayerRef.current = player;
      }

      event.data.arrayBuffer().then((buffer) => {
        console.log('Playing audio buffer, size:', buffer.byteLength, 'player exists:', !!audioPlayerRef.current);
        audioPlayerRef.current?.playAudioData(buffer);
      });
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      console.log('Received audio ArrayBuffer, size:', event.data.byteLength);

      // Initialize AudioPlayer if not already done
      if (!audioPlayerRef.current) {
        console.log('AudioPlayer not initialized yet, creating now...');
        const player = new AudioPlayer();
        player.setCallbacks(
          () => setState(prev => ({ ...prev, currentState: 'VOICE_STATE_SPEAKING' })),
          () => {
            setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'PLAYBACK_COMPLETE' }));
            }
          }
        );
        audioPlayerRef.current = player;
      }

      audioPlayerRef.current?.playAudioData(event.data);
      return;
    }

    // Handle text/JSON messages
    try {
      const message = JSON.parse(event.data);
      console.log('Voice WS message:', message);

      // Handle messages with payload wrapper (server format)
      const payload = message.payload || message;
      const messageType = message.type;

      switch (messageType) {
        case 'connected':
        case 'session_ready':
          console.log('Session ready received, starting audio...');
          setState(prev => ({
            ...prev,
            isConnected: true,
            sessionId: payload.sessionId || payload.session_id,
            currentState: payload.state || 'VOICE_STATE_LISTENING',
          }));

          // Start audio recording ONLY after session is confirmed ready
          if (!sessionReadyRef.current) {
            sessionReadyRef.current = true;

            // Initialize audio recorder
            const recorder = new AudioRecorder();
            audioRecorderRef.current = recorder;
            recorder.start((pcm16Data: ArrayBuffer) => {
              // Send audio only if session is ready and not muted
              if (wsRef.current?.readyState === WebSocket.OPEN && sessionReadyRef.current) {
                wsRef.current.send(pcm16Data);
                setAudioLevel(calculateAudioLevel(pcm16Data));
              } else {
                setAudioLevel(0);
              }
            }).catch(err => {
              console.error('Failed to start audio recording:', err);
              onError?.('Failed to access microphone. Please grant permission.');
            });

            // Initialize audio player
            const player = new AudioPlayer();
            player.setCallbacks(
              () => setState(prev => ({ ...prev, currentState: 'VOICE_STATE_SPEAKING' })),
              () => {
                setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'PLAYBACK_COMPLETE' }));
                }
              }
            );
            audioPlayerRef.current = player;
          }
          break;

        case 'state':
          setState(prev => ({
            ...prev,
            currentState: payload.state || payload,
          }));
          break;

        case 'transcription':
          const newTranscription: TranscriptionEntry = {
            id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: payload.text || payload.transcript || '',
            isFinal: payload.isFinal ?? payload.is_final ?? false,
            timestamp: new Date(),
            sender: 'user',
          };

          if (newTranscription.isFinal) {
            setTranscriptions(prev => [
              ...prev.filter(t => t.isFinal),
              newTranscription,
            ]);
          } else {
            setTranscriptions(prev => [
              ...prev.filter(t => t.isFinal),
              newTranscription,
            ]);
          }
          break;

        case 'response_text':
        case 'response':
        case 'assistant_message':
          const isFinal = payload.isFinal ?? payload.is_final ?? true;
          if (isFinal) {
            const newResponse: ResponseEntry = {
              id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text: payload.text || payload.message || payload.content || '',
              timestamp: new Date(),
              sender: 'bot',
            };
            setResponses(prev => [...prev, newResponse]);
          }
          break;

        case 'sentence_audio':
        case 'audio':
        case 'audio_chunk':
        case 'tts_audio':
          console.log('Audio message received:', messageType, payload);
          // Handle base64-encoded audio data
          const audioData = payload.audio || payload.data || payload.audioData || payload.chunk;
          if (audioData && typeof audioData === 'string') {
            try {
              // Decode base64 to ArrayBuffer
              const binaryString = atob(audioData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              console.log('Playing base64 audio, decoded size:', bytes.buffer.byteLength);
              audioPlayerRef.current?.playAudioData(bytes.buffer);
            } catch (decodeError) {
              console.error('Failed to decode base64 audio:', decodeError);
            }
          }
          break;

        case 'error':
          // Check if this is a real error or just a text chunk (server bug workaround)
          // Real errors typically have recoverable: true or specific error codes
          const isRealError = payload.recoverable === true ||
                              payload.errorCode ||
                              payload.code ||
                              (payload.errorMessage && payload.errorMessage.toLowerCase().includes('error'));

          if (isRealError) {
            const errorMsg = payload.message || payload.errorMessage || payload.error || 'Unknown error';
            setState(prev => ({ ...prev, error: errorMsg }));
            onError?.(errorMsg);
          } else {
            // This is likely a text chunk incorrectly sent as "error" type
            console.log('Received text chunk (sent as error):', payload.errorMessage);
          }
          break;

        case 'pong':
        case 'ping':
          // Respond to ping with pong to keep connection alive
          if (messageType === 'ping' && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PONG' }));
          }
          break;

        default:
          console.log('Unknown voice message type:', messageType, message);
          // Check if there's audio data in unknown message types
          if (payload?.audio || payload?.data || payload?.audioData) {
            console.log('Found audio data in unknown message type, attempting to play');
            const audioData = payload.audio || payload.data || payload.audioData;
            if (typeof audioData === 'string') {
              try {
                const binaryString = atob(audioData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                audioPlayerRef.current?.playAudioData(bytes.buffer);
              } catch (e) {
                console.error('Failed to decode audio from unknown message:', e);
              }
            }
          }
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
    }
  }, [onError]);

  // Start voice call
  const startCall = useCallback(async () => {
    if (isConnecting || state.isCallActive) return;

    setIsConnecting(true);
    setState(prev => ({ ...prev, error: null }));
    setTranscriptions([]);
    setResponses([]);

    try {
      // Get WebSocket ticket
      const ticketResponse = await getVoiceSessionTicket(tenantId, botId);
      const data = ticketResponse.responseStructure?.data;

      if (!data?.ticket) {
        throw new Error('No ticket received from server');
      }

      leadIdRef.current = data.leadId;

      // Connect WebSocket
      const wsUrl = buildVoiceWebSocketUrl(data.ticket, data.wsEndpoint);
      console.log('Connecting to voice WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      // IMPORTANT: Set binary type to arraybuffer for consistent handling
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice WebSocket connected, sending START_SESSION...');

        // Send START_SESSION message with flat structure (backend expects no payload wrapper)
        // Audio will be initialized AFTER we receive session_ready/connected response
        const startMessage = {
          type: 'START_SESSION',
          tenantId,
          botId,
          userId: leadIdRef.current || `user-${Date.now()}`,
          voice,
          language,
        };
        ws.send(JSON.stringify(startMessage));
        console.log('START_SESSION sent, waiting for session_ready...');

        setState(prev => ({
          ...prev,
          isCallActive: true,
          currentState: 'idle',
        }));

        setIsConnecting(false);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('Voice WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
        onError?.('Voice connection error');
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('Voice WebSocket closed:', event.code, event.reason);

        // Provide meaningful error message based on close code
        if (event.code !== 1000) { // 1000 = normal closure
          let errorMsg = 'Voice connection closed unexpectedly';
          if (event.code === 1011) {
            errorMsg = 'Voice service error. Please try again later.';
          } else if (event.code === 1008) {
            errorMsg = 'Voice session policy violation';
          } else if (event.code === 1003) {
            errorMsg = 'Voice service received unsupported data';
          } else if (event.reason) {
            errorMsg = event.reason;
          }
          onError?.(errorMsg);
        }

        cleanup();
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Failed to start voice call:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start call',
      }));
      onError?.(error instanceof Error ? error.message : 'Failed to start call');
      setIsConnecting(false);
    }
  }, [tenantId, botId, voice, language, isConnecting, state.isCallActive, handleMessage, onError]);

  // End voice call
  const endCall = useCallback(() => {
    // Send END_SESSION before closing
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'END_SESSION' }));
    }
    cleanup();
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      audioRecorderRef.current?.setMuted(newMuted);
      if (newMuted) {
        setAudioLevel(0);
      }
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  // Interrupt AI speaking
  const interrupt = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'INTERRUPT' }));
    }
    audioPlayerRef.current?.interrupt();
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Reset session ready flag
    sessionReadyRef.current = false;

    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;

    audioPlayerRef.current?.stop();
    audioPlayerRef.current = null;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isCallActive: false,
      isMuted: false,
      currentState: 'idle',
      sessionId: null,
      error: null,
    });

    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Ping keepalive
  useEffect(() => {
    if (!state.isCallActive) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [state.isCallActive]);

  return {
    state,
    transcriptions,
    responses,
    audioLevel,
    startCall,
    endCall,
    toggleMute,
    interrupt,
    isConnecting,
  };
};
