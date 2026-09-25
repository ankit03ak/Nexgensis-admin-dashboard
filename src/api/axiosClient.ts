import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL from environment variable or fallback to DummyJSON
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com';

export const AUTH_TOKEN_KEY = 'product_admin_token';
export const USER_DATA_KEY = 'product_admin_user';

// Create a single shared Axios instance for the entire application
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach bearer token to every outgoing request
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access errors (e.g. private browsing restrictions)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling and token expiration detection
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Check if error was caused by Axios request cancellation (AbortController)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Centralized 401 Unauthorized handling
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        // Dispatch custom event so AuthContext can handle logout without hard reload
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } catch {
        // Ignore
      }
    }

    // Extract user-friendly error message
    const message =
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Unable to connect to DummyJSON server. Please check your internet connection.'
        : error.message || 'An unexpected error occurred.');

    const enrichedError = new Error(message);
    (enrichedError as unknown as { status?: number }).status = error.response?.status;
    (enrichedError as unknown as { originalError: unknown }).originalError = error;

    return Promise.reject(enrichedError);
  }
);

export default axiosClient;
