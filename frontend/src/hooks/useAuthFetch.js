import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, getToken } from '../utils/api';

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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export function useForm(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return { values, errors, touched, handleChange, handleBlur, validate, reset, setFieldValue, setValues, setErrors };
}

export function preventInvalidNumberInput(e) {
  if (['e', 'E', '-', '+', '.'].includes(e.key)) e.preventDefault();
}

export function validatePositiveNumber(value, fieldName) {
  const num = Number(value);
  return !Number.isFinite(num) || num <= 0 ? `${fieldName} must be a positive number` : null;
}

export function validateNonNegativeNumber(value, fieldName) {
  const num = Number(value);
  return !Number.isFinite(num) || num < 0 ? `${fieldName} cannot be negative` : null;
}
