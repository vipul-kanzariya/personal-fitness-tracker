/**
 * Utility functions for status badges and formatting
 */

/**
 * Get badge class for BMI category
 * @param {string} category - BMI category
 * @returns {string} CSS class string
 */
export function getBmiBadgeClass(category) {
  const categoryMap = {
    'Underweight': 'bg-info bg-opacity-25 text-info border border-info border-opacity-50',
    'Normal': 'bg-success bg-opacity-25 text-success border border-success border-opacity-50',
    'Normal weight': 'bg-success bg-opacity-25 text-success border border-success border-opacity-50',
    'Overweight': 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50',
    'Obese': 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50',
    'Obesity': 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50',
  };
  return categoryMap[category] || 'bg-secondary text-subtle';
}

/**
 * Get badge class for order status
 * @param {string} status - Order status
 * @returns {string} CSS class string
 */
export function getOrderStatusBadgeClass(status) {
  const statusMap = {
    'delivered': 'badge-delivered',
    'cancelled': 'badge-cancelled',
    'processing': 'badge-pending',
    'pending': 'badge-pending',
  };
  return statusMap[status?.toLowerCase()] || 'badge-default';
}

/**
 * Get payment status badge class
 * @param {string} status - Payment status
 * @returns {string} CSS class string
 */
export function getPaymentBadgeClass(status) {
  return status === 'Paid'
    ? 'bg-success bg-opacity-25 text-success'
    : 'bg-warning bg-opacity-25 text-warning';
}

/**
 * Format a date for display
 * @param {string|Date} dateValue - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateValue, options = {}) {
  if (!dateValue) return 'N/A';

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'N/A';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return date.toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Format currency (Indian Rupees)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate progress percentage
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} maxPercent - Maximum percentage (default: 100)
 * @returns {number} Progress percentage
 */
export function calculateProgress(current, target, maxPercent = 100) {
  if (!target || target <= 0) return 0;
  return Math.min(maxPercent, Math.round(((current || 0) / target) * 100));
}

/**
 * Format label string (camelCase to Title Case)
 * @param {string} str - String to format
 * @returns {string} Formatted string
 */
export function formatLabel(str) {
  if (!str) return 'Item';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}