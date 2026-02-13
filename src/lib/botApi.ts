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
  is_lead_capture_required?: boolean;
  mandatoryLeadFields?: {
    name: boolean;
    phone: boolean;
    email: boolean;
    company: boolean;
  };
  salesIntentPriority?: string;
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
  leadCaptureRequired?: boolean;
  nameRequired?: boolean;
  phoneRequired?: boolean;
  emailRequired?: boolean;
  companyRequired?: boolean;
  salesIntentPriority?: string;
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
    throw new Error(error.message || 'Failed to fetch bots'
      
    );
  }

  return response.json();
};

export interface GetBotByIdResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: Bot;
  };
}

/**
 * Get a single bot by ID
 * @param botId - The bot identifier
 * @param tenantId - The tenant identifier
 * @returns Bot details
 */
export const getBotById = async (botId: string, tenantId: string): Promise<GetBotByIdResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/bots/${botId}?tenantId=${tenantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch bot');
  }

  return response.json();
};

export interface UpdateBotRequest {
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
  isActive?: boolean;
  is_lead_capture_required?: boolean;
  leadNameRequired?: boolean;
  leadPhoneRequired?: boolean;
  leadEmailRequired?: boolean;
  leadCompanyRequired?: boolean;
  salesIntentPriority?: string;
}

export interface UpdateBotResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: Bot;
  };
}

/**
 * Update a bot
 * @param botId - The bot identifier
 * @param data - The updated bot data
 * @returns Updated bot details
 */
export const updateBot = async (botId: string, data: UpdateBotRequest): Promise<UpdateBotResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  console.log('updateBot payload:', JSON.stringify(data, null, 2));

  const response = await fetch(`/api/v1/bots/${botId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update bot');
  }

  return response.json();
};

// Unresolved Query interfaces
export interface UnresolvedQuery {
  queryId: string;
  query: string;
  status: 'UNRESOLVED' | 'RESOLVED';
  botId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUnresolvedQueriesResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      totalPages: number;
      totalElements: number;
      pageable: {
        pageNumber: number;
        unpaged: boolean;
        paged: boolean;
        pageSize: number;
        offset: number;
        sort: {
          unsorted: boolean;
          sorted: boolean;
          empty: boolean;
        };
      };
      numberOfElements: number;
      last: boolean;
      first: boolean;
      size: number;
      content: UnresolvedQuery[];
      number: number;
      sort: {
        unsorted: boolean;
        sorted: boolean;
        empty: boolean;
      };
      empty: boolean;
    };
  };
}

/**
 * Get unresolved queries for a bot
 * @param botId - The bot identifier
 * @param page - Page number (default 0)
 * @param size - Page size (default 20)
 * @returns Paginated list of unresolved queries
 */
export const getUnresolvedQueries = async (
  botId: string,
  page: number = 0,
  size: number = 20
): Promise<GetUnresolvedQueriesResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/queries/bot/${botId}/unresolved?page=${page}&size=${size}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch unresolved queries');
  }

  return response.json();
};

export interface QueryAnswer {
  queryId: string;
  answer: string;
  approve: boolean;
}

export interface BulkAnswerResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: {
      totalRequested: number;
      successCount: number;
      failureCount: number;
      results: Array<{
        queryId: string;
        success: boolean;
        message: string;
      }>;
    };
  };
}

/**
 * Submit answers for unresolved queries
 * @param answers - Array of query answers
 * @returns Bulk answer response
 */
export const submitQueryAnswers = async (answers: QueryAnswer[]): Promise<BulkAnswerResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch('/api/v1/queries/bulk-answer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to submit query answers');
  }

  return response.json();
};

// Lead interfaces
export interface Lead {
  id: string;
  leadId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalInteractions: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface GetLeadsResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: Lead[];
  };
}

/**
 * Get all leads for a tenant
 * @param tenantId - The tenant identifier
 * @returns List of leads
 */
export const getLeads = async (tenantId: string): Promise<GetLeadsResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/leads?tenantId=${tenantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch leads');
  }

  return response.json();
};

// Create Lead interfaces
export interface CreateLeadRequest {
  tenantId: string;
  botId: string;
  sessionId?: string;
  sessionToken?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  channelType?: 'VOICE' | 'CHAT';
  lead?: Record<string, unknown>;
}

export interface CreateLeadResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: Lead;
  };
}

/**
 * Create a new lead
 * @param leadData - The lead data to create
 * @returns Created lead
 */
export const createLead = async (leadData: CreateLeadRequest): Promise<CreateLeadResponse> => {
  let accessToken: string | null = null;
  try {
    accessToken = await getValidAccessToken();
  } catch {
    // Auth not available - continue without it (for public/anonymous access)
  }

  const { sessionToken, ...leadPayload } = leadData;

  const response = await fetch('/api/v1/leads/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Tenant-Id': leadData.tenantId,
      ...(sessionToken && { 'X-Session-Token': sessionToken }),
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(leadPayload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create lead');
  }

  return response.json();
};

export interface DeleteBotResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: string;
  };
}

/**
 * Delete a bot permanently
 * @param botId - The bot identifier
 * @param tenantId - The tenant identifier
 * @returns Delete response
 */
export const deleteBot = async (botId: string, tenantId: string): Promise<DeleteBotResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/bots/${botId}?tenantId=${tenantId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete bot');
  }

  // Handle 204 No Content response
  if (response.status === 204) {
    return {
      status: 204,
      message: 'Bot deleted successfully',
      responseStructure: {
        toastMessage: 'Bot deleted successfully',
        data: 'Bot deleted',
      },
    };
  }

  return response.json();
};

// Lead Interaction interfaces
export interface LeadInteraction {
  leadId: string;
  tenantId: string;
  botId: string;
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  lead: Record<string, string>;
  totalInteractions: number;
  createdAt: string;
}

export interface GetLeadInteractionsResponse {
  status: number;
  message: string;
  // API may return data flat or wrapped in responseStructure
  responseStructure?: {
    toastMessage?: string;
    data?: LeadInteraction[];
    total?: number;
    count?: number;
    currentPage?: number;
  };
  data?: LeadInteraction[];
  total?: number;
  count?: number;
  currentPage?: number;
}

/**
 * Extract lead interactions data from either flat or wrapped response format
 */
export const extractLeadInteractions = (response: GetLeadInteractionsResponse) => {
  const rs = response.responseStructure;
  return {
    data: rs?.data || response.data || [],
    total: rs?.total ?? response.total ?? 0,
    count: rs?.count ?? response.count ?? 0,
    currentPage: rs?.currentPage ?? response.currentPage ?? 0,
  };
};

/**
 * Get lead interactions for a tenant (optionally filtered by bot)
 * @param tenantId - The tenant identifier
 * @param botId - Optional bot identifier to filter by
 * @param page - Page number (default 0)
 * @param size - Page size (default 20)
 * @returns Paginated list of lead interactions
 */
export const getLeadInteractions = async (
  tenantId: string,
  botId?: string,
  page: number = 0,
  size: number = 20,
  search?: string
): Promise<GetLeadInteractionsResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  let url = `/api/v1/leads/interactions?tenantId=${tenantId}&page=${page}&size=${size}`;
  if (botId) {
    url += `&botId=${botId}`;
  }
  if (search?.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch lead interactions');
  }

  return response.json();
};

/**
 * Initiate lead deletion — sends OTP to admin email
 */
export const initiateLeadDeletion = async (tenantId: string, sessionIds: string[]): Promise<string> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch('/api/v1/leads/delete/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({ tenantId, sessionIds }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to initiate lead deletion');
  }

  const data = await response.json();
  return data.responseStructure?.toastMessage || 'OTP sent to your email';
};

export interface LeadDeletionResult {
  interactionsDeleted: number;
  leadsDeleted: number;
  deletedSessionIds: string[];
  deletedLeadIds: string[];
}

/**
 * Confirm lead deletion with OTP
 */
export const confirmLeadDeletion = async (tenantId: string, sessionIds: string[], otp: string): Promise<LeadDeletionResult> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  console.log('confirmLeadDeletion payload:', JSON.stringify({ tenantId, sessionIds, otp }, null, 2));

  const response = await fetch('/api/v1/leads/delete/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept': '*/*',
    },
    body: JSON.stringify({ tenantId, sessionIds, otp }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to confirm lead deletion');
  }

  const data = await response.json();
  return data.responseStructure?.data;
};

// Knowledge Graph interfaces
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  entityType: string;
  description: string;
  source: string;
  properties: Record<string, string>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, string>;
}

export interface KnowledgeGraphStats {
  nodeCount: number;
  edgeCount: number;
  entityTypes: Record<string, number>;
  relationshipTypes: Record<string, number>;
}

export interface KnowledgeGraphData {
  status: string;
  tenantId: string;
  botId: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  stats: KnowledgeGraphStats;
}

export interface GetKnowledgeGraphResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: KnowledgeGraphData;
  };
}

/**
 * Get knowledge graph for a bot
 * @param tenantId - The tenant identifier
 * @param botId - The bot identifier
 * @returns Knowledge graph with nodes, edges, and stats
 */
export const getKnowledgeGraph = async (
  tenantId: string,
  botId: string
): Promise<GetKnowledgeGraphResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/graph/tenants/${tenantId}/bots/${botId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch knowledge graph');
  }

  return response.json();
};

// Recent Activity interfaces
export interface ActivityItem {
  id: number;
  tenantId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  actorType: string;
  actorId: string;
  correlationId: string;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface GetRecentActivityResponse {
  status: number;
  message: string;
  data: ActivityItem[];
  total: number;
  count: number;
  currentPage: number;
}

/**
 * Get recent activity for a tenant
 * @param tenantId - The tenant identifier
 * @param page - Page number (default 0)
 * @param size - Page size (default 20)
 * @returns Paginated list of activity items
 */
export const getRecentActivity = async (
  tenantId: string,
  page: number = 0,
  size: number = 20
): Promise<GetRecentActivityResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(
    `/api/v1/activity?tenantId=${tenantId}&page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'accept': '*/*',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch recent activity');
  }

  return response.json();
};

// Dashboard Metrics interfaces
export interface DashboardMetrics {
  bots: {
    textBots: number;
    voiceBots: number;
    totalActive: number;
  };
  sessions: {
    total: number;
    textSessions: number;
    voiceSessions: number;
  };
}

export interface GetDashboardMetricsResponse {
  status: number;
  message: string;
  responseStructure: {
    toastMessage: string;
    data: DashboardMetrics;
  };
}

/**
 * Get dashboard metrics for a tenant
 * @param tenantId - The tenant identifier
 * @returns Dashboard metrics including bot and session counts
 */
export const getDashboardMetrics = async (tenantId: string): Promise<GetDashboardMetricsResponse> => {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/v1/dashboard/metrics?tenantId=${tenantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch dashboard metrics');
  }

  return response.json();
};
