import { getValidAccessToken } from './auth';
import type { UserInfo } from '@/types/chat';

/**
 * Chat history message from the API
 */
export interface ChatHistoryMessage {
  role: string;
  content: string;
}

/**
 * Chat history response structure
 */
export interface ChatHistoryResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      status: string;
      tenantId: string;
      sessionId: string;
      botId: string;
      summary: string;
      messages: ChatHistoryMessage[];
      messageCount: number;
      createdAt: string;
      endedAt: string;
      metadata: Record<string, string>;
    };
  };
}

/**
 * Get chat history for a session
 * @param tenantId - The tenant identifier
 * @param botId - The bot identifier
 * @param sessionId - The session identifier
 * @returns Chat history with messages
 */
export const getChatHistory = async (
  tenantId: string,
  botId: string,
  sessionId: string
): Promise<ChatHistoryResponse> => {
  const accessToken = await getValidAccessToken();

  const headers: Record<string, string> = {
    'accept': '*/*',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `/api/v1/chat/history/tenants/${tenantId}/bots/${botId}/sessions/${sessionId}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch chat history (HTTP ${response.status})`);
  }

  return response.json();
};

/**
 * Chat session response structure
 */
export interface ChatServerSessionResponse {
  session_id: string;
  session_token: string;
  chatbot_id: string;
  tenant_id: string;
  status: string;
  chatbot_config: {
    agent_name: string;
    welcome_message: string;
  };
  lead_form_required: boolean;
  lead_id?: string;
  created_at?: string;
}

/**
 * Generate a unique fingerprint for anonymous sessions
 */
const generateFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    Date.now().toString(36),
    Math.random().toString(36).substring(2),
  ].join('|');
  return btoa(fingerprint).substring(0, 32);
};

/**
 * Create a new anonymous chat session
 * @param tenantId - The tenant identifier
 * @param botId - The chatbot/bot identifier
 * @param agentName - The agent name for chatbot config
 * @param welcomeMessage - The welcome message for chatbot config
 * @returns Session response with sessionToken
 */
export const createChatServerSession = async (
  tenantId: string,
  botId: string,
  agentName: string = 'AI Assistant',
  welcomeMessage: string = 'Hello! How can I help you today?',
  leadInfo?: { firstName: string; lastName?: string; email: string; phone?: string }
): Promise<ChatServerSessionResponse> => {
  const fingerprint = generateFingerprint();

  const response = await fetch('/api/v1/chat/sessions/anonymous', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({
      botId: botId,
      channelType: 'TEXT',
      fingerprint,
      metadata: {},
      ...(leadInfo && {
        firstName: leadInfo.firstName,
        lastName: leadInfo.lastName,
        email: leadInfo.email,
        phone: leadInfo.phone,
      }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create chat session');
  }

  const data = await response.json();
  const sessionData = data.responseStructure?.data;

  const resolvedSessionId = sessionData?.sessionId
    || sessionData?.session_id
    || sessionData?.id
    || sessionData?.sessionToken
    || '';

  return {
    session_id: resolvedSessionId,
    session_token: sessionData?.sessionToken || sessionData?.session_token || '',
    chatbot_id: botId,
    tenant_id: tenantId,
    status: 'active',
    chatbot_config: {
      agent_name: sessionData?.chatbotName || agentName,
      welcome_message: welcomeMessage,
    },
    lead_form_required: sessionData?.isLeadCaptureRequired ?? sessionData?.leadCaptureRequired ?? sessionData?.lead_form_required ?? true,
    lead_id: sessionData?.leadId,
  };
};


/**
 * Get session info via Main API
 * @param sessionToken - The session token from createChatSession
 * @returns Session info including status and message count
 */
export const getSessionInfo = async (sessionToken: string) => {
  const response = await fetch('/api/v1/chat/sessions/info', {
    method: 'GET',
    headers: {
      'X-Session-Token': sessionToken,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get session info');
  }

  return response.json();
};

/**
 * End a chat session
 * REST API: DELETE /api/v1/chat/sessions
 * @param sessionToken - The session token from createChatServerSession
 * @param tenantId - The tenant identifier
 */
export const endChatSession = async (sessionToken: string, tenantId?: string): Promise<void> => {
  const response = await fetch('/api/v1/chat/sessions', {
    method: 'DELETE',
    headers: {
      'accept': '*/*',
      'X-Session-Token': sessionToken,
      ...(tenantId && { 'X-Tenant-Id': tenantId }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.responseStructure?.toastMessage || error.message || 'Failed to end chat session');
  }
};

/**
 * Submit lead form to Main API (authenticated)
 * @param tenantId - Tenant identifier
 * @param botId - Bot identifier
 * @param sessionId - Session ID from createChatServerSession
 * @param userInfo - User information (firstName, lastName, email, phone, capturedData)
 */
export const submitLeadForm = async (
  tenantId: string,
  botId: string,
  sessionId: string,
  userInfo: UserInfo,
  sessionToken?: string
) => {
  let accessToken: string | null = null;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    // Auth not available - use session token for public/anonymous access
  }

  // Build lead data: start with defaults and merge any captured data
  const leadData: Record<string, string> = {
    Source: 'Website Chat',
    Channel: 'TEXT',
    ...(userInfo.capturedData || {}),
  };

  const payload: Record<string, unknown> = {
    tenantId,
    botId,
    sessionId,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName || '',
    email: userInfo.email,
    phone: userInfo.phone || '',
    lead: leadData,
  };

  const response = await fetch('/api/v1/leads/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Tenant-Id': tenantId,
      ...(sessionToken && { 'X-Session-Token': sessionToken }),
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to submit lead form');
  }

  return response.json();
};

/**
 * Send a message and receive streaming response via SSE
 * @param tenantId - Tenant identifier
 * @param botId - Chatbot identifier
 * @param sessionToken - Session token from createChatServerSession
 * @param message - User message text
 * @param onToken - Callback for each token received
 * @param onComplete - Callback when streaming is complete
 * @param onError - Callback on error
 */
export const sendMessageWithStream = async (
  tenantId: string,
  botId: string,
  sessionToken: string,
  message: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/v1/chat/message/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'X-Session-Token': sessionToken,
        'X-Tenant-Id': tenantId,
        'X-Bot-Id': botId,
      },
      body: JSON.stringify({
        query: message,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to send message');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (separated by double newlines or single newlines)
      const lines = buffer.split('\n');
      buffer = ''; // Reset buffer, we'll add back incomplete lines

      let currentEvent = 'token'; // Default event type

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Parse SSE event type
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
          continue;
        }

        // Parse SSE data
        if (line.startsWith('data:')) {
          try {
            const dataStr = line.slice(5).trim(); // Remove "data:" prefix

            // Skip empty data
            if (!dataStr) continue;

            const parsed = JSON.parse(dataStr);
            console.log('SSE parsed:', currentEvent, parsed);

            // Handle token event - check for content field
            if (parsed.content !== undefined) {
              onToken(parsed.content);
            }

            // Handle done event or completion indicators
            if (currentEvent === 'done' || parsed.finish_reason || parsed.complete) {
              onComplete();
              return;
            }
          } catch (e) {
            // If JSON parse fails, it might be a partial message
            // Add it back to buffer if it's the last line
            if (i === lines.length - 1) {
              buffer = line;
            }
            console.log('SSE parse error:', e, 'line:', line);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
};
