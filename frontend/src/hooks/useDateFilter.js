import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for filtering items by date range
 * Replaces duplicated date filtering logic across Diet, Workout, BMI pages
 *
 * @param {Array} items - Array of items to filter
 * @param {string} dateField - Field name containing the date (default: 'createdAt')
 * @returns {Object} Filtered items and filter controls
 */
export function useDateFilter(items, dateField = 'createdAt') {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All' },
  ];

  const getFilterLabel = useCallback((value) => {
    const option = filterOptions.find(f => f.value === value);
    return option?.label || value;
  }, []);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    if (filter === 'all') return items;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return items.filter((item) => {
      const dateValue = item[dateField] || item.createdAt || item.date;
      if (!dateValue) return false;

      const itemDate = new Date(dateValue);
      itemDate.setHours(0, 0, 0, 0);

      if (filter === 'today') {
        return itemDate.getTime() === now.getTime();
      }

      if (filter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return itemDate >= weekAgo;
      }

      if (filter === 'month') {
        return itemDate.getMonth() === now.getMonth() &&
               itemDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [items, filter, dateField]);

  // Calculate totals for numeric fields
  const calculateTotals = useCallback((numericFields) => {
    return filteredItems.reduce((acc, item) => {
      numericFields.forEach(field => {
        acc[field] = (acc[field] || 0) + (Number(item[field]) || 0);
      });
      return acc;
    }, {});
  }, [filteredItems]);

  return {
    filter,
    setFilter,
    filteredItems,
    filterOptions,
    getFilterLabel,
    calculateTotals,
  };
}

/**
 * Format date to local ISO string (no timezone shift)
 * Fixes "1 Day" missing today's data in different timezones
 * @param {Date} date - Date object
 * @returns {string} Formatted date string YYYY-MM-DD
 */
export function toLocalDateString(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is today
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {boolean}
 */
export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Convert meters to feet and inches
 * @param {number} meters - Height in meters
 * @returns {string} Formatted string (e.g., "5' 9\"")
 */
export function metersToFeet(meters) {
  if (!meters) return 'N/A';
  const totalInches = meters / 0.0254;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}