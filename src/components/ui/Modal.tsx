import { Dialog, Transition } from '@headlessui/react';
import React from 'react';

import { XIcon } from '@/icons';

interface ModalProps {
  isOpen?: boolean;
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  children,
  onClose,
  title,
  description,
  showCloseButton = true,
  size = 'md',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case '2xl':
        return 'max-w-6xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <Dialog
      as="div"
      className="relative z-50"
      open={isOpen}
      onClose={onClose}
      data-testid="modal"
      data-title={title}
    >
      <Transition show={isOpen}>
        <Transition.Child
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/70"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            data-testid="modal-backdrop"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4">
            <Transition.Child
              as="div"
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`relative my-4 w-full border-2 border-black bg-white ${getSizeClasses()}`}
                data-testid="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between border-b border-black p-6">
                  <div>
                    <Dialog.Title
                      as="h2"
                      id="modal-title"
                      className="text-2xl font-extrabold text-black"
                    >
                      {title}
                    </Dialog.Title>
                    {description && (
                      <p className="mt-2 text-sm text-neutral-500">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="-m-2 p-2 text-black hover:bg-white"
                      aria-label="Close modal"
                      data-testid="modal-close"
                    >
                      <XIcon className="size-6" />
                    </button>
                  )}
                </div>
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </Dialog>
  );
};

export default Modal;
