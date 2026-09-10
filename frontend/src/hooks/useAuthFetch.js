import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, getToken } from '../utils/api';

/**
 * Custom hook for API calls with loading and error state
 * @returns {Object} { loading, error, execute, clearError }
 */
export function useAuthFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (config) => {
    const token = getToken();
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        ...config,
        url: `${API_BASE_URL}${config.url}`,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Request failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError, setError };
}

/**
 * Hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const validationErrors = validateFn ? validateFn(values) : {};
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validateFn]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFieldValue,
    setValues,
    setErrors,
  };
}

/**
 * Prevent invalid characters in number inputs
 * Call this on onKeyDown for number inputs
 * @param {Event} e - Keyboard event
 */
export function preventInvalidNumberInput(e) {
  if (['e', 'E', '-', '+', '.'].includes(e.key)) {
    e.preventDefault();
  }
}

/**
 * Validate that a number is positive
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null
 */
export function validatePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
}

/**
 * Validate that a number is non-negative
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null
 */
export function validateNonNegativeNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} cannot be negative`;
  }
  return null;
}