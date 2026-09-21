
/**
 * Reusable filter buttons component
 * Used across Diet, Workout, BMI pages
 *
 * @param {Object} props
 * @param {string} props.filter - Current active filter
 * @param {Function} props.setFilter - Filter change handler
 * @param {Array} props.options - Custom filter options (optional)
 */
function FilterButtons({ filter, setFilter, options }) {
  const defaultOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All' },
  ];

  const filterOptions = options || defaultOptions;

  return (
    <div className="d-flex gap-2 mb-3" role="group" aria-label="Date filter">
      {filterOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn btn-sm ${filter === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setFilter(opt.value)}
          aria-pressed={filter === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;