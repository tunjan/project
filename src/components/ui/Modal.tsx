import React, { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { XIcon } from '@/icons';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  title,
  description,
  showCloseButton = true,
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
        className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="relative m-4 w-full max-w-lg border-2 border-black bg-white"
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
                <p className="mt-1 text-sm text-neutral-600">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="-m-2 p-2 text-black hover:bg-neutral-100"
                aria-label="Close modal"
              >
                <XIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default Modal;
