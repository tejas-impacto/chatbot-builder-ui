import { getValidAccessToken } from './auth';
import type { UserInfo, CreateSessionResponse } from '@/types/chat';

const CHAT_SERVER_URL = 'http://172.16.0.99:8002';

/**
 * Create a new chat session via Main API (authenticated)
 * @param chatbotId - The chatbot identifier
 * @returns Session response with sessionToken
 */
export const createChatSession = async (chatbotId: string): Promise<CreateSessionResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch('/api/v1/chat/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({
      chatbotId,
      channelType: 'TEXT',
      metadata: {},
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create chat session');
  }

  return response.json();
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
 * Submit lead form to Chat Server (public - no auth required)
 * @param tenantId - Tenant identifier
 * @param chatbotId - Chatbot identifier
 * @param sessionId - Session ID from createChatSession
 * @param userInfo - User information (name, email, phone)
 */
export const submitLeadForm = async (
  tenantId: string,
  chatbotId: string,
  sessionId: string,
  userInfo: UserInfo
) => {
  const response = await fetch(
    `${CHAT_SERVER_URL}/chat/${tenantId}/${chatbotId}/lead-form`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_info: userInfo,
      }),
    }
  );

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
 * @param sessionId - Session ID
 * @param message - User message text
 * @param onToken - Callback for each token received
 * @param onComplete - Callback when streaming is complete
 * @param onError - Callback on error
 */
export const sendMessageWithStream = async (
  tenantId: string,
  chatbotId: string,
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(
      `${CHAT_SERVER_URL}/chat/${tenantId}/${chatbotId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        // Parse SSE format: "data: {...}"
        if (line.startsWith('data: ')) {
          try {
            const data = line.slice(6); // Remove "data: " prefix
            const parsed = JSON.parse(data);

            if (parsed.content) {
              onToken(parsed.content);
            }

            if (parsed.complete) {
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
