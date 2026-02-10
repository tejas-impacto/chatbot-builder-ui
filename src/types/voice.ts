// Voice session types
export interface VoiceSessionTicketResponse {
  status: string;
  message: string;
  responseStructure: {
    toastMessage?: string;
    data: {
      ticket: string;
      sessionToken: string;
      leadId: string;
      wsEndpoint: string;
      ticketExpiresAt: string;
      botId: string;
    };
  };
}

// WebSocket message types
export interface StartSessionMessage {
  type: 'START_SESSION';
  tenantId: string;
  botId: string;
  userId: string;
  voice: string;
  language: string;
}

export interface InterruptMessage {
  type: 'INTERRUPT';
}

export interface PlaybackCompleteMessage {
  type: 'PLAYBACK_COMPLETE';
}

export interface PingMessage {
  type: 'PING';
}

export interface EndSessionMessage {
  type: 'END_SESSION';
}

export interface ConfigUpdateMessage {
  type: 'CONFIG_UPDATE';
  voice?: string;
  language?: string;
}

export type OutgoingVoiceMessage =
  | StartSessionMessage
  | InterruptMessage
  | PlaybackCompleteMessage
  | PingMessage
  | EndSessionMessage
  | ConfigUpdateMessage;

// Incoming WebSocket message types
export interface ConnectedMessage {
  type: 'connected';
  sessionId: string;
  voice: string;
  language: string;
  state: VoiceState;
}

export interface StateMessage {
  type: 'state';
  state: VoiceState;
  timestamp: number;
}

export interface TranscriptionMessage {
  type: 'transcription';
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface ResponseTextMessage {
  type: 'response_text';
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface SentenceAudioMessage {
  type: 'sentence_audio';
  text: string;
  format: 'AUDIO_FORMAT_WAV';
  sampleRate: number;
  durationMs: number;
  timestamp: number;
}

export interface ErrorMessage {
  type: 'error';
  errorMessage: string;
  recoverable: boolean;
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
}

export interface InterruptedMessage {
  type: 'interrupted';
}

export interface ConfigUpdatedMessage {
  type: 'config_updated';
  voice: string;
  language: string;
}

export type IncomingVoiceMessage =
  | ConnectedMessage
  | StateMessage
  | TranscriptionMessage
  | ResponseTextMessage
  | SentenceAudioMessage
  | ErrorMessage
  | PongMessage
  | InterruptedMessage
  | ConfigUpdatedMessage;

// Voice states (matching API guide)
export type VoiceState =
  | 'VOICE_STATE_LISTENING'
  | 'VOICE_STATE_RECEIVING'
  | 'VOICE_STATE_PROCESSING'
  | 'VOICE_STATE_SPEAKING'
  | 'VOICE_STATE_ERROR'
  | 'VOICE_STATE_DISCONNECTED';

// Voice chat component state
export interface VoiceChatState {
  isConnected: boolean;
  isCallActive: boolean;
  isMuted: boolean;
  currentState: VoiceState | 'idle';
  sessionId: string | null;
  error: string | null;
}

// Conversation entries
export interface TranscriptionEntry {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: Date;
  sender: 'user';
}

export interface ResponseEntry {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'bot';
}

export type ConversationEntry = TranscriptionEntry | ResponseEntry;

// Audio configuration
export interface AudioConfig {
  inputSampleRate: number;
  outputSampleRate: number;
  chunkSize: number;
  channels: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  inputSampleRate: 16000,
  outputSampleRate: 24000,
  chunkSize: 3200,
  channels: 1,
};

// Voice options
export const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Deep)' },
  { value: 'fable', label: 'Fable (Expressive)' },
  { value: 'onyx', label: 'Onyx (Authoritative)' },
  { value: 'nova', label: 'Nova (Warm)' },
  { value: 'shimmer', label: 'Shimmer (Clear)' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
] as const;
