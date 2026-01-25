// Token refresh interval (25 minutes in milliseconds)
const REFRESH_INTERVAL = 25 * 60 * 1000;

// Buffer time before expiry to refresh (2 minutes in milliseconds)
const REFRESH_BUFFER = 2 * 60 * 1000;

let refreshTimer: NodeJS.Timeout | null = null;

// Response type for check-email endpoint
export interface CheckEmailResponse {
  emailExists: boolean;
  hasPassword: boolean;
  linkedProviders: string[];
  primaryAuthMethod: string | null;
}

/**
 * Check what authentication methods are available for an email
 * @param email The email to check
 * @returns CheckEmailResponse with available auth methods
 */
export const checkEmail = async (email: string): Promise<CheckEmailResponse> => {
  try {
    const response = await fetch('/api/v1/auth/check-email', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check email');
    }

    return data.responseStructure.data;
  } catch (error) {
    console.error('Check email error:', error);
    throw error;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', data.message);
      return false;
    }

    // Update tokens in localStorage
    const { accessToken, refreshToken: newRefreshToken, accessExpiresIn, refreshExpiresIn } = data.responseStructure.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('accessExpiresIn', String(accessExpiresIn));
    localStorage.setItem('refreshExpiresIn', String(refreshExpiresIn));

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
      // Refresh failed, user needs to login again
      logout();
      return null;
    }

    // Return the new token
    return localStorage.getItem('accessToken');
  }

  return accessToken;
};

export const startTokenRefreshTimer = () => {
  // Clear any existing timer
  stopTokenRefreshTimer();

  // Check if user is logged in
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return;
  }

  // Set up automatic refresh every 25 minutes
  refreshTimer = setInterval(async () => {
    const success = await refreshAccessToken();
    if (!success) {
      // If refresh fails, redirect to login
      logout();
    }
  }, REFRESH_INTERVAL);

  console.log('Token refresh timer started (25 min interval)');
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('Token refresh timer stopped');
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
