import React from 'react';

/**
 * Status badge component with color coding
 * Used in Orders and BMI pages
 *
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {string} props.type - Badge type ('order', 'bmi', 'payment')
 */
function StatusBadge({ status, type = 'order' }) {
  const getBadgeClass = () => {
    const lowerStatus = status?.toLowerCase();

    if (type === 'order') {
      switch (lowerStatus) {
        case 'delivered':
          return 'bg-success bg-opacity-25 text-success border border-success border-opacity-50';
        case 'cancelled':
          return 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50';
        case 'processing':
        case 'pending':
          return 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50';
        default:
          return 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50';
      }
    }

    if (type === 'bmi') {
      switch (lowerStatus) {
        case 'underweight':
          return 'bg-info bg-opacity-25 text-info border border-info border-opacity-50';
        case 'normal':
        case 'normal weight':
          return 'bg-success bg-opacity-25 text-success border border-success border-opacity-50';
        case 'overweight':
          return 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50';
        case 'obese':
        case 'obesity':
          return 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50';
        default:
          return 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50';
      }
    }

    if (type === 'payment') {
      switch (lowerStatus) {
        case 'paid':
          return 'bg-success bg-opacity-25 text-success border border-success border-opacity-50';
        case 'pending':
          return 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50';
        case 'failed':
          return 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50';
        default:
          return 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50';
      }
    }

    return 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50';
  };

  return (
    <span className={`badge px-2 py-1 rounded-pill small ${getBadgeClass()}`}>
      {status}
    </span>
  );
}

export default StatusBadge;