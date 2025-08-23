import React from 'react';
import Modal from './Modal';
import { ShieldExclamationIcon } from '@/icons';

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
        };
      case 'warning':
        return {
          icon: 'text-warning',
          confirmButton: 'btn-warning',
        };
      case 'info':
        return {
          icon: 'text-info',
          confirmButton: 'btn-info',
        };
      default:
        return {
          icon: 'text-danger',
          confirmButton: 'btn-danger',
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (!isOpen) return null;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${variantStyles.icon}`}>
            <ShieldExclamationIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-black">{title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{message}</p>
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
