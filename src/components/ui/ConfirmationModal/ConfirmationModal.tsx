import React from 'react';

import { ShieldExclamationIcon } from '@/icons';

import Modal from '../Modal/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-danger',
          confirmButton: 'btn-danger',
          messageText: 'text-red-700',
        };
      case 'warning':
        return {
          icon: 'text-warning',
          confirmButton: 'btn-warning',
          messageText: 'text-yellow-700',
        };
      case 'info':
        return {
          icon: 'text-info',
          confirmButton: 'btn-info',
          messageText: 'text-blue-700',
        };
      default:
        return {
          icon: 'text-danger',
          confirmButton: 'btn-danger',
          messageText: 'text-red-700',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // No longer conditionally render here; the Modal itself handles it
  return (
    <Modal title={title} onClose={onClose} isOpen={isOpen}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="shrink-0">
            <ShieldExclamationIcon className={`size-6 ${variantStyles.icon}`} />
          </div>
          <div className="flex-1">
            <p className={`mt-2 text-sm ${variantStyles.messageText}`}>
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button onClick={onClose} className="btn-outline flex-1">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 ${variantStyles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
