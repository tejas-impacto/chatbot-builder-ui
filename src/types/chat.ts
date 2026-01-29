// Session types
export interface CreateSessionRequest {
  chatbotId: string;
  channelType: 'TEXT' | 'VOICE';
  metadata?: Record<string, string>;
}

export interface CreateSessionResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      sessionToken: string;
      expiresAt: string;
      channelType: string;
      chatbotId: string;
      chatbotName: string;
    };
  };
}

export interface SessionInfo {
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  channelType: string;
  chatbotId: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  messageCount: number;
  unansweredQueryCount: number;
}

// Lead form types
export interface UserInfo {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  capturedData?: Record<string, string>;
}

export interface SubmitLeadFormRequest {
  session_id: string;
  user_info: UserInfo;
}

export interface SubmitLeadFormResponse {
  success: boolean;
  message: string;
}

// Message types
export interface SendMessageRequest {
  message: string;
  session_id: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  time: string;
  isStreaming?: boolean;
}
