/**
 * API Configuration Constants
 * Centralized API URL management
 */

// Get API URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Creates axios config with authorization header
 * @param {string} token - JWT token from localStorage
 * @returns {object} Axios config object
 */
export const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token || localStorage.getItem('token')}`,
  },
});

/**
 * Get token from localStorage
 * @returns {string|null} JWT token
 */
export const getToken = () => localStorage.getItem('token');

/**
 * Get user role from localStorage
 * @returns {string|null} User role
 */
export const getUserRole = () => localStorage.getItem('role');

/**
 * Get user name from localStorage
 * @returns {string} User name or default
 */
export const getUserName = () => localStorage.getItem('name') || 'Athlete';

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
};