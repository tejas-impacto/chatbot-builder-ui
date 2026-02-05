import { useEffect, useRef, useState, useCallback } from 'react';
import { getVoiceSessionTicket, buildVoiceWebSocketUrl, type VoiceLeadInfo } from '@/lib/voiceApi';
import { createLead } from '@/lib/botApi';
import { AudioRecorder, AudioPlayer, calculateAudioLevel } from '@/utils/audioUtils';
import type {
  VoiceChatState,
  VoiceState,
  TranscriptionEntry,
  ResponseEntry,
  SentenceAudioMessage,
} from '@/types/voice';

interface UseVoiceChatOptions {
  tenantId: string;
  botId: string;
  botName?: string;
  voice?: string;
  language?: string;
  onError?: (error: string) => void;
}

interface UseVoiceChatReturn {
  state: VoiceChatState;
  transcriptions: TranscriptionEntry[];
  responses: ResponseEntry[];
  audioLevel: number;
  startCall: (leadInfo?: VoiceLeadInfo) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  interrupt: () => void;
  updateConfig: (voice?: string, language?: string) => void;
  isConnecting: boolean;
  currentVoice: string;
  currentLanguage: string;
}

// Reconnection configuration
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export const useVoiceChat = ({
  tenantId,
  botId,
  voice = 'alloy',
  language = 'en',
  onError,
}: UseVoiceChatOptions): UseVoiceChatReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const leadIdRef = useRef<string | null>(null);
  const leadInfoRef = useRef<VoiceLeadInfo | null>(null);
  const leadSubmittedRef = useRef(false);
  const sessionReadyRef = useRef(false);
  const pendingAudioMetaRef = useRef<SentenceAudioMessage | null>(null);

  // Reconnection state
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(false);
  const lastTicketRef = useRef<{ ticket: string; wsEndpoint?: string } | null>(null);

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
  const [currentVoice, setCurrentVoice] = useState(voice);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // Stop audio playback and clear queue
  const stopAudioPlayback = useCallback(() => {
    if (audioPlayerRef.current) {
      console.log('Stopping audio playback...');
      audioPlayerRef.current.interrupt();
      console.log('Audio playback stopped');
    } else {
      console.warn('No audio player to stop');
    }
  }, []);

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
      MAX_RECONNECT_DELAY
    );
    return delay;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    sessionReadyRef.current = false;
    shouldReconnectRef.current = false;
    pendingAudioMetaRef.current = null;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

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

  // Initialize audio components after session is ready
  const initializeAudio = useCallback(() => {
    if (sessionReadyRef.current) return;
    sessionReadyRef.current = true;

    // Initialize audio recorder
    const recorder = new AudioRecorder();
    audioRecorderRef.current = recorder;
    recorder.start((pcm16Data: ArrayBuffer) => {
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
      () => {
        console.log('Audio playback started');
        setState(prev => ({ ...prev, currentState: 'VOICE_STATE_SPEAKING' }));
      },
      () => {
        console.log('Audio playback ended - sending PLAYBACK_COMPLETE');
        setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'PLAYBACK_COMPLETE' }));
          console.log('PLAYBACK_COMPLETE sent to server');
        } else {
          console.warn('WebSocket not open - could not send PLAYBACK_COMPLETE');
        }
      }
    );
    audioPlayerRef.current = player;
  }, [onError]);

  // Handle WebSocket messages (matching the API guide)
  const handleMessage = useCallback((event: MessageEvent) => {
    // Handle binary audio data (Part 2 of sentence_audio)
    if (event.data instanceof ArrayBuffer) {
      console.log('Received audio ArrayBuffer, size:', event.data.byteLength);

      if (!audioPlayerRef.current) {
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
      pendingAudioMetaRef.current = null;
      return;
    }

    // Handle Blob fallback for binary data
    if (event.data instanceof Blob) {
      console.log('Received audio Blob, size:', event.data.size);

      if (!audioPlayerRef.current) {
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
        audioPlayerRef.current?.playAudioData(buffer);
        pendingAudioMetaRef.current = null;
      });
      return;
    }

    // Handle text/JSON messages
    try {
      const message = JSON.parse(event.data);
      console.log('Voice WS message:', message);

      // Handle messages with payload wrapper (server format compatibility)
      const payload = message.payload || message;
      const messageType = message.type;

      switch (messageType) {
        case 'connected':
        case 'session_ready':
          console.log('Session connected/ready:', payload);
          // Reset reconnect attempts on successful connection
          reconnectAttemptsRef.current = 0;

          const sessionId = payload.sessionId || payload.session_id;

          setState(prev => ({
            ...prev,
            isConnected: true,
            sessionId,
            currentState: payload.state || 'VOICE_STATE_LISTENING',
          }));

          if (payload.voice) setCurrentVoice(payload.voice);
          if (payload.language) setCurrentLanguage(payload.language);

          // Submit lead after session is ready (same flow as chat)
          if (leadInfoRef.current && !leadSubmittedRef.current && tenantId && botId) {
            leadSubmittedRef.current = true;
            createLead({
              tenantId,
              botId,
              sessionId,
              firstName: leadInfoRef.current.firstName,
              lastName: leadInfoRef.current.lastName,
              email: leadInfoRef.current.email,
              phone: leadInfoRef.current.phone,
              channelType: 'VOICE',
            }).then(() => {
              console.log('Lead submitted successfully after session ready');
            }).catch((error) => {
              console.error('Failed to submit lead:', error);
              // Don't fail the session - lead submission is secondary
            });
          }

          initializeAudio();
          break;

        case 'state':
          const newState = payload.state || payload;
          setState(prev => ({ ...prev, currentState: newState as VoiceState }));
          break;

        case 'transcription':
          const transcription: TranscriptionEntry = {
            id: `trans-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            text: payload.text || payload.transcript || '',
            isFinal: payload.isFinal ?? payload.is_final ?? false,
            timestamp: new Date(),
            sender: 'user',
          };

          setTranscriptions(prev => {
            // Keep only final transcriptions plus the current one
            const finals = prev.filter(t => t.isFinal);
            return transcription.isFinal
              ? [...finals, transcription]
              : [...finals, transcription];
          });
          break;

        case 'response_text':
        case 'response':
        case 'assistant_message':
          const isFinal = payload.isFinal ?? payload.is_final ?? true;
          if (isFinal) {
            const response: ResponseEntry = {
              id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              text: payload.text || payload.message || payload.content || '',
              timestamp: new Date(),
              sender: 'bot',
            };
            setResponses(prev => [...prev, response]);
          }
          break;

        case 'sentence_audio':
          // Part 1: Store metadata, binary audio follows
          console.log('Audio metadata received:', payload);
          pendingAudioMetaRef.current = {
            type: 'sentence_audio',
            text: payload.text,
            format: payload.format || 'AUDIO_FORMAT_WAV',
            sampleRate: payload.sampleRate || 24000,
            durationMs: payload.durationMs,
            timestamp: payload.timestamp,
          };
          break;

        case 'audio':
        case 'audio_chunk':
        case 'tts_audio':
          // Handle base64-encoded audio data (legacy format)
          const audioData = payload.audio || payload.data || payload.audioData || payload.chunk;
          if (audioData && typeof audioData === 'string') {
            try {
              const binaryString = atob(audioData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              audioPlayerRef.current?.playAudioData(bytes.buffer);
            } catch (decodeError) {
              console.error('Failed to decode base64 audio:', decodeError);
            }
          }
          break;

        case 'interrupted':
          // Server detected user speech (barge-in) - stop audio playback immediately
          console.log('Server detected user speech - stopping audio playback');
          stopAudioPlayback();
          setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));
          break;

        case 'config_updated':
          // Configuration change confirmed
          console.log('Config updated:', payload);
          if (payload.voice) setCurrentVoice(payload.voice);
          if (payload.language) setCurrentLanguage(payload.language);
          break;

        case 'error':
          const errorMsg = payload.message || payload.errorMessage || payload.error || 'Unknown error';

          // WORKAROUND: Backend bug sends bot text responses as "error" type messages
          // Real errors have: valid timestamp (> 0), error codes, or error-related keywords
          // Fake errors (text chunks) have: timestamp = 0, no error codes, conversational text
          const hasValidTimestamp = payload.timestamp && payload.timestamp > 0;
          const hasErrorCode = payload.errorCode || payload.code;
          const containsErrorKeywords = /error|fail|invalid|session|not found|unauthorized|timeout/i.test(errorMsg);
          const isRealError = hasValidTimestamp || hasErrorCode || containsErrorKeywords;

          if (!isRealError) {
            // This is a bot text response incorrectly sent as "error" type (backend bug)
            console.log('Received bot text (sent as error type):', errorMsg);
            // Don't trigger error handling or reconnection - just log it
            // The response_text handler should receive the actual response
            break;
          }

          // This is a real error
          const isRecoverable = payload.recoverable ?? false;
          console.error('Voice error:', errorMsg, 'recoverable:', isRecoverable);

          setState(prev => ({
            ...prev,
            error: errorMsg,
            currentState: 'VOICE_STATE_ERROR',
          }));
          onError?.(errorMsg);

          // Only attempt reconnection for connection-related errors, not content errors
          // Clear the cached ticket so reconnection gets a fresh one
          if (!isRecoverable && shouldReconnectRef.current) {
            lastTicketRef.current = null; // Force getting a new ticket
            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              attemptReconnect();
            }
          }
          break;

        case 'pong':
          // Keepalive acknowledged
          break;

        case 'ping':
          // Respond to server ping
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'PONG' }));
          }
          break;

        default:
          console.log('Unknown voice message type:', messageType, message);
          // Check for audio data in unknown message types
          if (payload?.audio || payload?.data || payload?.audioData) {
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
  }, [onError, initializeAudio, stopAudioPlayback, tenantId, botId]);

  // Attempt reconnection with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      onError?.('Failed to reconnect after multiple attempts');
      cleanup();
      return;
    }

    const delay = getReconnectDelay();
    console.log(`Attempting reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      reconnectAttemptsRef.current++;

      if (lastTicketRef.current) {
        try {
          const wsUrl = buildVoiceWebSocketUrl(
            lastTicketRef.current.ticket,
            lastTicketRef.current.wsEndpoint
          );
          connectWebSocket(wsUrl);
        } catch (error) {
          console.error('Reconnection failed:', error);
          attemptReconnect();
        }
      } else {
        // Need to get a new ticket
        try {
          const ticketResponse = await getVoiceSessionTicket(tenantId, botId);
          const data = ticketResponse.responseStructure?.data;

          if (data?.ticket) {
            lastTicketRef.current = { ticket: data.ticket, wsEndpoint: data.wsEndpoint };
            leadIdRef.current = data.leadId;

            const wsUrl = buildVoiceWebSocketUrl(data.ticket, data.wsEndpoint);
            connectWebSocket(wsUrl);
          } else {
            throw new Error('No ticket received');
          }
        } catch (error) {
          console.error('Failed to get new ticket for reconnection:', error);
          attemptReconnect();
        }
      }
    }, delay);
  }, [tenantId, botId, getReconnectDelay, cleanup, onError]);

  // Connect to WebSocket
  const connectWebSocket = useCallback((wsUrl: string) => {
    console.log('Connecting to voice WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Voice WebSocket connected, sending START_SESSION...');

      const startMessage = {
        type: 'START_SESSION',
        tenantId,
        botId,
        userId: leadIdRef.current || `user-${Date.now()}`,
        voice: currentVoice,
        language: currentLanguage,
      };
      ws.send(JSON.stringify(startMessage));

      setState(prev => ({
        ...prev,
        isCallActive: true,
        currentState: 'idle',
        error: null,
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

      setState(prev => ({
        ...prev,
        isConnected: false,
        currentState: 'VOICE_STATE_DISCONNECTED',
      }));

      // Handle different close codes
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

        if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          console.log('Connection lost, attempting reconnection...');
          attemptReconnect();
        } else {
          onError?.(errorMsg);
          cleanup();
        }
      } else {
        cleanup();
      }

      setIsConnecting(false);
    };
  }, [tenantId, botId, currentVoice, currentLanguage, handleMessage, onError, attemptReconnect, cleanup]);

  // Start voice call
  const startCall = useCallback(async (leadInfo?: VoiceLeadInfo) => {
    if (isConnecting || state.isCallActive) return;

    setIsConnecting(true);
    setState(prev => ({ ...prev, error: null }));
    setTranscriptions([]);
    setResponses([]);
    reconnectAttemptsRef.current = 0;
    shouldReconnectRef.current = true;
    leadSubmittedRef.current = false;

    // Store lead info for submission after session is ready
    leadInfoRef.current = leadInfo || null;

    try {
      // Get ticket without lead info - lead will be submitted after session is ready
      const ticketResponse = await getVoiceSessionTicket(tenantId, botId);
      const data = ticketResponse.responseStructure?.data;

      if (!data?.ticket) {
        throw new Error('No ticket received from server');
      }

      leadIdRef.current = data.leadId;
      lastTicketRef.current = { ticket: data.ticket, wsEndpoint: data.wsEndpoint };

      const wsUrl = buildVoiceWebSocketUrl(data.ticket, data.wsEndpoint);
      connectWebSocket(wsUrl);

    } catch (error) {
      console.error('Failed to start voice call:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start call',
      }));
      onError?.(error instanceof Error ? error.message : 'Failed to start call');
      setIsConnecting(false);
    }
  }, [tenantId, botId, isConnecting, state.isCallActive, connectWebSocket, onError]);

  // End voice call
  const endCall = useCallback(() => {
    shouldReconnectRef.current = false;

    // Send END_SESSION to WebSocket (session ends via WebSocket, not REST)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'END_SESSION' }));
    }

    // Clear lead info ref (lead was already submitted when session was ready)
    leadInfoRef.current = null;

    cleanup();
  }, [cleanup]);

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

  // Manual interrupt - stop audio playback
  // Note: stopAudioPlayback() calls audioPlayer.interrupt() which triggers onPlaybackEnd callback
  // The onPlaybackEnd callback already sends PLAYBACK_COMPLETE to the server
  const interrupt = useCallback(() => {
    console.log('Manual interrupt triggered - stopping audio playback');

    // Stop audio playback - this triggers onPlaybackEnd which sends PLAYBACK_COMPLETE
    stopAudioPlayback();

    // Set state to listening so UI reflects we're ready for new input
    setState(prev => ({ ...prev, currentState: 'VOICE_STATE_LISTENING' }));

    console.log('Interrupt complete - PLAYBACK_COMPLETE should have been sent');
  }, [stopAudioPlayback]);

  // Update voice/language configuration mid-session
  const updateConfig = useCallback((newVoice?: string, newLanguage?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const configMessage: { type: string; voice?: string; language?: string } = {
        type: 'CONFIG_UPDATE',
      };

      if (newVoice) {
        configMessage.voice = newVoice;
        setCurrentVoice(newVoice);
      }
      if (newLanguage) {
        configMessage.language = newLanguage;
        setCurrentLanguage(newLanguage);
      }

      wsRef.current.send(JSON.stringify(configMessage));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Ping keepalive (every 30 seconds as per guide)
  useEffect(() => {
    if (!state.isCallActive) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000);

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
    updateConfig,
    isConnecting,
    currentVoice,
    currentLanguage,
  };
};
