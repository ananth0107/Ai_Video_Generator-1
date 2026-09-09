import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

export default function DropdownSelect({
  value,
  onChange,
  options = [], // [{ value: '16:9', label: '16:9', icon?: ReactNode, desc?: string }]
  label = '',
  badge = '',
  placeholder = 'Select option',
  className = '',
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder
  };

  return (
    <div className={`thamili-dropdown-wrapper ${isOpen ? 'is-open' : ''} ${className}`} ref={dropdownRef}>
      {label && (
        <label className="dropdown-field-label">
          {badge && <span className="form-step-badge">{badge}</span>}
          <span>{label}</span>
        </label>
      )}

      <div className={`dropdown-anchor-box ${isOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className={`dropdown-trigger-btn ${isOpen ? 'active is-open' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="trigger-content-left">
            {selectedOption.icon && (
              <span className="trigger-icon">{selectedOption.icon}</span>
            )}
            <span className="trigger-label-text">{selectedOption.label}</span>
          </div>

          <span className={`trigger-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
            <Icons.ChevronDown />
          </span>
        </button>

        {isOpen && (
          <div className={`dropdown-menu-list ${align === 'right' ? 'align-right' : ''}`} role="listbox">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="option-row-left">
                    {opt.icon && <span className="option-icon">{opt.icon}</span>}
                    <div className="option-text-wrap">
                      <span className="option-main-label">{opt.label}</span>
                      {opt.desc && <span className="option-sub-label">{opt.desc}</span>}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="option-check-icon" aria-hidden="true">
                      <Icons.Check />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

