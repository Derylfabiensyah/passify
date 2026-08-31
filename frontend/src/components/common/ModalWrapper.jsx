import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * ModalWrapper
 * Accessible, robust, reusable modal container supporting:
 * - role="dialog" and aria-modal="true"
 * - aria-labelledby or aria-label for assistive technologies
 * - Escape key to close
 * - Backdrop click to close
 * - Body scroll lock (prevent background scrolling)
 * - Focus management & Focus trap (keeps Tab/Shift+Tab inside modal)
 * - Configurable sizes: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
 * - Smooth entrance animation (fade-in & zoom)
 */
export default function ModalWrapper({
  isOpen = true,
  onClose,
  title,
  titleId,
  ariaLabel,
  size = 'md',
  maxWidth,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  customHeader,
  children
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Map size to Tailwind max-width classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-5xl'
  };

  const resolvedMaxWidth = maxWidth || sizeClasses[size] || 'max-w-lg';

  // Handle escape key & focus trap
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onClose?.();
        return;
      }

      // Focus Trap: Keep Tab and Shift+Tab cycling inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [closeOnEscape, onClose]
  );

  // Body scroll lock and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    previousActiveElement.current = document.activeElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first interactive element or modal container
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector(
          'input:not([disabled]), button:not([disabled]):not([aria-label="Tutup modal"]):not([aria-label="Tutup"]), select:not([disabled]), textarea:not([disabled])'
        ) || modalRef.current.querySelector('button:not([disabled])');

        if (focusable) {
          focusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);

      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  const generatedTitleId = titleId || (title ? 'modal-title' : undefined);

  return (
    <div
      className={`modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 ${overlayClassName}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={generatedTitleId}
        aria-label={!generatedTitleId ? (ariaLabel || (typeof title === 'string' ? title : 'Dialog Modal')) : undefined}
        tabIndex={-1}
        className={`modal-content relative w-full ${resolvedMaxWidth} max-h-[90vh] overflow-y-auto bg-white rounded-3xl sm:rounded-2xl shadow-2xl border border-gray-200/80 outline-none animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Custom Header or Default Header if title/close button provided */}
        {customHeader ? (
          customHeader
        ) : (title || showCloseButton) ? (
          <div className="flex items-center justify-between gap-4 p-5 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
            {title ? (
              typeof title === 'string' ? (
                <h3 id={generatedTitleId} className="text-base sm:text-lg font-bold text-gray-900 font-['Outfit'] tracking-tight">
                  {title}
                </h3>
              ) : (
                <div id={generatedTitleId}>{title}</div>
              )
            ) : <div />}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
