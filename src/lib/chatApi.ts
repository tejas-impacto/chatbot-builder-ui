import { getValidAccessToken } from './auth';
import type { UserInfo } from '@/types/chat';

/**
 * Chat session response structure
 */
export interface ChatServerSessionResponse {
  session_id: string;
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
 * @param chatbotId - The chatbot/bot identifier
 * @param agentName - The agent name for chatbot config
 * @param welcomeMessage - The welcome message for chatbot config
 * @returns Session response with sessionToken
 */
export const createChatServerSession = async (
  tenantId: string,
  chatbotId: string,
  agentName: string = 'AI Assistant',
  welcomeMessage: string = 'Hello! How can I help you today?'
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
      botId: chatbotId,
      channelType: 'TEXT',
      fingerprint,
      metadata: {},
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create chat session');
  }

  // Map the API response to ChatServerSessionResponse format
  const data = await response.json();
  const sessionData = data.responseStructure?.data;

  return {
    session_id: sessionData?.sessionToken || '',
    chatbot_id: chatbotId,
    tenant_id: tenantId,
    status: 'active',
    chatbot_config: {
      agent_name: sessionData?.chatbotName || agentName,
      welcome_message: welcomeMessage,
    },
    lead_form_required: true,
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
  userInfo: UserInfo
) => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const payload: Record<string, unknown> = {
    tenantId,
    botId,
    sessionId,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName || '',
    email: userInfo.email,
    phone: userInfo.phone || '',
  };

  // Include capturedData if provided
  if (userInfo.capturedData && Object.keys(userInfo.capturedData).length > 0) {
    payload.capturedData = userInfo.capturedData;
  }

  const response = await fetch('/api/v1/leads/interactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
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
 * @param chatbotId - Chatbot identifier
 * @param sessionToken - Session token from createChatServerSession
 * @param message - User message text
 * @param onToken - Callback for each token received
 * @param onComplete - Callback when streaming is complete
 * @param onError - Callback on error
 */
export const sendMessageWithStream = async (
  tenantId: string,
  chatbotId: string,
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
        'accept': 'text/event-stream',
        'X-Session-Token': sessionToken,
        'X-Tenant-Id': tenantId,
        'X-Bot-Id': chatbotId,
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

    let currentEvent = '';

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        // Parse SSE event type
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        }
        // Parse SSE data
        else if (line.startsWith('data: ')) {
          try {
            const data = line.slice(6); // Remove "data: " prefix
            const parsed = JSON.parse(data);

            // Handle token event
            if (currentEvent === 'token' && parsed.content) {
              onToken(parsed.content);
            }

            // Handle done event
            if (currentEvent === 'done') {
              onComplete();
              return;
            }
          } catch {
            // Continue on parse error - might be partial JSON
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
};
