import React, { useState } from "react";
import { type User } from "@/types";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: {
    name: string;
    instagram: string;
    hostingAvailability: boolean;
    hostingCapacity: number;
  }) => void;
}

const InputField: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ label, id, value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-black mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
    />
  </div>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [instagram, setInstagram] = useState(user.instagram || "");
  const [hostingAvailability, setHostingAvailability] = useState(
    user.hostingAvailability
  );
  const [hostingCapacity, setHostingCapacity] = useState(
    user.hostingCapacity || 1
  );

  const handleSubmit = () => {
    onSave({
      name,
      instagram,
      hostingAvailability,
      hostingCapacity: Number(hostingCapacity) || 0,
    });
  };

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
          <h2 className="text-2xl font-extrabold text-black">Edit Profile</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Update your personal and hosting information.
          </p>
        </div>

        <div className="my-6 space-y-4">
          <InputField
            label="Full Name"
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label="Instagram Handle"
            id="edit-instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            required={false}
          />

          <div className="border-t border-black pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hostingAvailability}
                onChange={(e) => setHostingAvailability(e.target.checked)}
                className="h-5 w-5 accent-[#d81313]"
              />
              <span className="font-bold text-black">
                I am available to host other activists
              </span>
            </label>
            {hostingAvailability && (
              <div className="mt-3 pl-8">
                <label
                  htmlFor="hosting-capacity"
                  className="block text-sm font-bold text-black mb-1"
                >
                  How many people can you host?
                </label>
                <input
                  type="number"
                  id="hosting-capacity"
                  value={hostingCapacity}
                  onChange={(e) => setHostingCapacity(Number(e.target.value))}
                  min="1"
                  className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
