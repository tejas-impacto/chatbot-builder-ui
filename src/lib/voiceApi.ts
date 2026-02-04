import { getValidAccessToken } from './auth';
import type { VoiceSessionTicketResponse } from '@/types/voice';

/**
 * Generate a fingerprint for voice sessions
 */
const generateVoiceFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    'voice',
    Date.now().toString(36),
    Math.random().toString(36).substring(2),
  ].join('|');
  return btoa(fingerprint).substring(0, 32);
};

/**
 * Get a WebSocket ticket for voice session
 * REST API: POST /api/v1/voice/sessions/anonymous
 */
export const getVoiceSessionTicket = async (
  tenantId: string,
  botId: string
): Promise<VoiceSessionTicketResponse> => {
  const accessToken = await getValidAccessToken();
  const fingerprint = generateVoiceFingerprint();

  const response = await fetch('/api/v1/voice/sessions/anonymous', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Tenant-Id': tenantId,
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({
      botId,
      fingerprint,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.responseStructure?.toastMessage || error.message || 'Failed to get voice session ticket');
  }

  return response.json();
};

/**
 * Build WebSocket URL with ticket
 */
export const buildVoiceWebSocketUrl = (ticket: string, wsEndpoint?: string): string => {
  if (wsEndpoint) {
    return `${wsEndpoint}?ticket=${ticket}`;
  }

  // Default: use current host with appropriate protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/api/v1/voice/ws?ticket=${ticket}`;
};
