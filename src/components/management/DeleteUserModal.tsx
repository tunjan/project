import React from "react";
import { type User } from "@/types";
import { TrashIcon } from "@/icons";

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border-4 border-black p-8 relative w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#d81313]">
            <TrashIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-black">
            Delete User
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Are you sure you want to delete{" "}
            <span className="font-bold">{user.name}</span>? This action is
            permanent and cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
