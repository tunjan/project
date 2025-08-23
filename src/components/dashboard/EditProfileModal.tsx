import React, { useState } from 'react';
import { type User } from '@/types';
import { InputField } from '@/components/ui/Form';
import Modal from '@/components/ui/Modal';
import DeactivateAccountModal from './DeactivateAccountModal';
import { useUsersActions } from '@/store';
import { useAuthActions } from '@/store/auth.store';
import { toast } from 'sonner';
import { UsersIcon } from '@/icons';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: {
    name: string;
    instagram: string;
    hostingAvailability: boolean;
    hostingCapacity: number;
    profilePictureUrl: string;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [instagram, setInstagram] = useState(user.instagram || '');
  const [hostingAvailability, setHostingAvailability] = useState(
    user.hostingAvailability
  );
  const [hostingCapacity, setHostingCapacity] = useState(
    user.hostingCapacity || 1
  );
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user.profilePictureUrl
  );
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const { deleteUser } = useUsersActions();
  const { logout } = useAuthActions();

  const handleGenerateAvatar = () => {
    const newUrl = `https://i.pravatar.cc/150?u=${Date.now()}`;
    setProfilePictureUrl(newUrl);
  };

  const handleSubmit = () => {
    onSave({
      name,
      instagram,
      hostingAvailability,
      hostingCapacity: Number(hostingCapacity) || 0,
      profilePictureUrl,
    });
  };

  const handleDeactivate = () => {
    deleteUser(user.id);
    setIsDeactivateModalOpen(false);
    toast.error('Your account has been permanently deleted.');
    logout();
  };

  return (
    <>
      {isDeactivateModalOpen && (
        <DeactivateAccountModal
          user={user}
          onClose={() => setIsDeactivateModalOpen(false)}
          onConfirm={handleDeactivate}
        />
      )}
      <Modal
        title="Edit Profile"
        onClose={onClose}
        description="Update your personal and hosting information."
      >
        <div className="my-6 space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={profilePictureUrl}
              alt="Profile avatar"
              className="h-20 w-20 object-cover"
            />
            <button
              type="button"
              onClick={handleGenerateAvatar}
              className="flex items-center space-x-2 border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
            >
              <UsersIcon className="h-4 w-4" />
              <span>New Avatar</span>
            </button>
          </div>

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
            <label className="flex cursor-pointer items-center space-x-3">
              <input
                type="checkbox"
                checked={hostingAvailability}
                onChange={(e) => setHostingAvailability(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
              <span className="font-bold text-black">
                I am available to host other activists
              </span>
            </label>
            {hostingAvailability && (
              <div className="mt-3 pl-8">
                <label
                  htmlFor="hosting-capacity"
                  className="mb-1 block text-sm font-bold text-black"
                >
                  How many people can you host?
                </label>
                <input
                  type="number"
                  id="hosting-capacity"
                  value={hostingCapacity}
                  onChange={(e) => setHostingCapacity(Number(e.target.value))}
                  min="1"
                  className="block w-full border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {}
        <div className="mt-8 space-y-4 border-t-4 border-primary pt-4">
          <h3 className="font-extrabold text-black">Danger Zone</h3>
          <div>
            <p className="text-sm font-bold text-black">Deactivate Account</p>
            <p className="mb-2 text-sm text-neutral-600">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              onClick={() => setIsDeactivateModalOpen(true)}
              className="w-full bg-primary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Delete My Account
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
          <button
            onClick={onClose}
            className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </>
  );
};

export default EditProfileModal;
