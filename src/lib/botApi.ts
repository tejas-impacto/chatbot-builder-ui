import { getValidAccessToken } from './auth';

export interface CreateBotRequest {
  tenantId: string;
  conversationStyle: {
    chatLength: string;
    chatGuidelines: string;
    voiceLength: string;
    voiceGuidelines: string;
  };
  channelType: string;
  purposeCategory: string;
  persona: string;
  agentName: string;
  toneOfVoice: string;
}

export interface CreateBotResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      bot_id: string;
      agent_name: string;
      channel_type: string;
      created_at: string;
    };
  };
}

export interface InitSessionResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      ticket: string;
      websocket_url: string;
      expires_in: number;
      session_id: string;
      bot_id: string;
    };
  };
}

// Create bot with form data
export const createBot = async (data: CreateBotRequest): Promise<CreateBotResponse> => {
  const accessToken = await getValidAccessToken();

  const response = await fetch('/api/v1/bots', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create bot');
  }

  return response.json();
};

// Initialize bot creation session
export const initBotCreationSession = async (botId: string): Promise<InitSessionResponse> => {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`/api/v1/bots/${botId}/create/init`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to initialize bot creation session');
  }

  return response.json();
};

// Cancel bot creation session
export const cancelBotCreation = async (botId: string): Promise<void> => {
  const accessToken = await getValidAccessToken();

  const response = await fetch(`/api/v1/bots/${botId}/create`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to cancel bot creation');
  }
};

// Bot data structure from API
export interface Bot {
  botId: string;
  tenantId: string;
  chatLength: string;
  chatGuidelines: string;
  voiceLength: string;
  voiceGuidelines: string;
  channelType: string;
  purposeCategory: string;
  persona: string;
  agentName: string;
  toneOfVoice: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  active: boolean;
}

export interface GetBotsResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: Bot[];
  };
}

/**
 * Get all bots for a tenant
 * @param tenantId - The tenant identifier
 * @returns List of bots
 */
export const getBotsByTenant = async (tenantId: string): Promise<GetBotsResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/bots/tenant/${tenantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch bots');
  }

  return response.json();
};
