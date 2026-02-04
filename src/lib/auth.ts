// Buffer time before expiry to refresh (2 minutes in milliseconds)
const REFRESH_BUFFER = 2 * 60 * 1000;

// Minimum refresh interval (1 minute) to prevent too frequent refreshes
const MIN_REFRESH_INTERVAL = 60 * 1000;

let refreshTimer: NodeJS.Timeout | null = null;
let visibilityListenerAdded = false;

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    const response = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Refresh-Token': `Bearer ${refreshToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', data.message);
      return false;
    }

    // Update tokens in localStorage
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessExpiresIn,
      refreshExpiresIn,
      onboardingCompleted,
      documentUploaded,
      tenantId,
    } = data.responseStructure.data;

    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    localStorage.setItem('accessExpiresIn', String(accessExpiresIn));
    localStorage.setItem('refreshExpiresIn', String(refreshExpiresIn));

    // Update onboarding and tenant info if provided
    if (onboardingCompleted !== undefined) {
      localStorage.setItem('isOnboarded', String(onboardingCompleted));
    }
    if (documentUploaded !== undefined) {
      localStorage.setItem('documentUploaded', String(documentUploaded));
    }
    if (tenantId) {
      localStorage.setItem('tenantId', tenantId);
    }

    // Store token creation time for expiry calculation
    localStorage.setItem('tokenCreatedAt', String(Date.now()));

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// Check if token is expired or about to expire
export const isTokenExpired = (): boolean => {
  const tokenCreatedAt = localStorage.getItem('tokenCreatedAt');
  const accessExpiresIn = localStorage.getItem('accessExpiresIn');

  if (!tokenCreatedAt || !accessExpiresIn) {
    // If we don't have timing info, assume token might be expired
    return true;
  }

  const createdAt = parseInt(tokenCreatedAt);
  const expiresIn = parseInt(accessExpiresIn) * 1000; // Convert to milliseconds
  const expiryTime = createdAt + expiresIn;

  // Return true if token is expired or will expire within buffer time
  return Date.now() >= (expiryTime - REFRESH_BUFFER);
};

// Custom error for session expiration
export class SessionExpiredError extends Error {
  constructor() {
    super('SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

// Get valid access token - refreshes if expired
export const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return null;
  }

  // Check if token is expired or about to expire
  if (isTokenExpired()) {
    console.log('Token expired or expiring soon, refreshing...');
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      // Refresh failed - throw error instead of auto-logout
      // Let the calling component decide how to handle it
      console.warn('Token refresh failed - session may have expired');
      throw new SessionExpiredError();
    }

    // Return the new token
    return localStorage.getItem('accessToken');
  }

  return accessToken;
};

// Calculate dynamic refresh interval based on token expiry
const getRefreshInterval = (): number => {
  const accessExpiresIn = localStorage.getItem('accessExpiresIn');

  if (!accessExpiresIn) {
    // Default to 5 minutes if no expiry info
    return 5 * 60 * 1000;
  }

  const expiresInMs = parseInt(accessExpiresIn) * 1000; // Convert seconds to ms
  // Refresh at 80% of the token lifetime, but at least MIN_REFRESH_INTERVAL
  const refreshInterval = Math.max(expiresInMs * 0.8 - REFRESH_BUFFER, MIN_REFRESH_INTERVAL);

  return refreshInterval;
};

// Handle visibility change - refresh token when tab becomes visible
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    // Check if token is expired or about to expire
    if (isTokenExpired()) {
      console.log('Tab became visible, token expired - refreshing...');
      const success = await refreshAccessToken();
      if (!success) {
        // Don't auto-logout - let the next API call handle it
        console.warn('Background token refresh failed on visibility change');
      } else {
        // Restart the timer with fresh interval
        startTokenRefreshTimer();
      }
    }
  }
};

export const startTokenRefreshTimer = () => {
  // Clear any existing timer
  stopTokenRefreshTimer();

  // Check if user is logged in
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return;
  }

  // Calculate dynamic refresh interval based on token expiry
  const refreshInterval = getRefreshInterval();

  // Set up automatic refresh
  refreshTimer = setInterval(async () => {
    const success = await refreshAccessToken();
    if (!success) {
      // Don't auto-logout - let the next API call handle it gracefully
      console.warn('Background token refresh failed - user may need to re-login on next action');
    }
  }, refreshInterval);

  // Add visibility change listener (only once)
  if (!visibilityListenerAdded) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityListenerAdded = true;
    console.log('Visibility change listener added');
  }

  console.log(`Token refresh timer started (${Math.round(refreshInterval / 1000 / 60)} min interval)`);
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('Token refresh timer stopped');
  }

  // Remove visibility listener
  if (visibilityListenerAdded) {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    visibilityListenerAdded = false;
    console.log('Visibility change listener removed');
  }
};

export const logout = () => {
  stopTokenRefreshTimer();
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessExpiresIn');
  localStorage.removeItem('refreshExpiresIn');
  localStorage.removeItem('tokenCreatedAt');
  localStorage.removeItem('isOnboarded');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

// Store token creation time after login
export const storeTokenTimestamp = () => {
  localStorage.setItem('tokenCreatedAt', String(Date.now()));
};
