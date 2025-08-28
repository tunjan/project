import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { XIcon } from '@/icons';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  title,
  description,
  showCloseButton = true,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <FocusTrap>
      <div
        className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`relative my-4 w-full border-2 border-black bg-white ${
            size === 'sm'
              ? 'max-w-sm'
              : size === 'md'
                ? 'max-w-lg'
                : size === 'lg'
                  ? 'max-w-2xl'
                  : size === 'xl'
                    ? 'max-w-4xl'
                    : size === '2xl'
                      ? 'max-w-6xl'
                      : 'max-w-lg'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-black p-6">
            <div>
              <h2
                id="modal-title"
                className="text-2xl font-extrabold text-black"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="-m-2 p-2 text-black hover:bg-white"
                aria-label="Close modal"
              >
                <XIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default Modal;
