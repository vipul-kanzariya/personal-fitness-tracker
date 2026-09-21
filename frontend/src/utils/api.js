/**
 * API Configuration Constants
 * Centralized API URL management
 */

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || (
  import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin
)).replace(/\/+$/, '');

export const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token || localStorage.getItem('token')}`,
  },
});

export const getToken = () => localStorage.getItem('token');
export const getUserRole = () => localStorage.getItem('role');
export const getUserName = () => localStorage.getItem('name') || 'Athlete';

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
};
