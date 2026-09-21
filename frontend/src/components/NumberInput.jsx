import { forwardRef } from 'react';

/**
 * Number input component with built-in validation
 * Prevents invalid characters and handles constraints properly
 *
 * @param {Object} props
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {any} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step value
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Input size (sm, md, lg)
 */
const NumberInput = forwardRef(function NumberInput(
  {
    name,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    min,
    max,
    step = 0.1,
    error,
    required = false,
    disabled = false,
    className = '',
    size = 'md',
    helpText,
    ...rest
  },
  ref
) {
  const inputId = `number-input-${name}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const sizeClass = {
    sm: 'form-control-sm',
    md: '',
    lg: 'form-control-lg',
  }[size];

  // Prevent e, E, +, - characters while allowing . for decimals
  const handleKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, arrows, . (for decimals)
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'].includes(e.key) ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key))
    ) {
      return;
    }
    // Prevent e, E, +, -
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label text-subtle fw-bold small text-uppercase">
          {label}
          {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type="number"
        id={inputId}
        name={name}
        className={`form-control dark-input ${sizeClass} ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        inputMode="decimal"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        {...rest}
      />
      {error && (
        <div id={errorId} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
      {helpText && !error && (
        <small id={helpId} className="form-text text-subtle">
          {helpText}
        </small>
      )}
    </div>
  );
});

export default NumberInput;