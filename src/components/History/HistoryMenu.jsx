import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

export default function HistoryMenu({ onEditName, onDelete }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onEditName();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    onDelete();
  };

  return (
    <div className="history-menu-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggle}
        className={`history-menu-trigger-btn ${isOpen ? 'active' : ''}`}
        title="More options"
        aria-label="More video options"
        aria-expanded={isOpen}
      >
        <Icons.MoreVertical />
      </button>

      {isOpen && (
        <div className="history-dropdown-popover" role="menu">
          <button
            type="button"
            className="history-popover-item"
            onClick={handleEditClick}
            role="menuitem"
          >
            <span className="popover-item-icon">
              <Icons.Edit />
            </span>
            <span>{t('rename', 'Rename')}</span>
          </button>

          <div className="history-popover-divider" />

          <button
            type="button"
            className="history-popover-item item-danger"
            onClick={handleDeleteClick}
            role="menuitem"
          >
            <span className="popover-item-icon">
              <Icons.Trash2 />
            </span>
            <span>{t('delete', 'Delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
