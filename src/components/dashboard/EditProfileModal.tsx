import React, { useState } from 'react';
import { type User } from '@/types';
import Modal from '@/components/ui/Modal';
import { UsersIcon } from '@/icons';
import { InputField } from '@/components/ui/Form';
import Avatar from '@/components/ui/Avatar';

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
  onDeactivate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
  onDeactivate,
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

  return (
    <Modal
      title="Edit Profile"
      onClose={onClose}
      description="Update your personal and hosting information."
      size="lg"
    >
      <div className="my-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <Avatar
              src={profilePictureUrl}
              alt="Profile avatar"
              className="h-20 w-20 object-cover"
              editable={true}
              onImageChange={(newImageUrl) => {
                setProfilePictureUrl(newImageUrl);
              }}
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
          <p className="text-sm text-neutral-600">
            💡 Click on your avatar to upload a custom image, or use the "New
            Avatar" button for a random one.
          </p>
        </div>

        <InputField
          label="Full Name"
          id="edit-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          autoFocus
        />
        <InputField
          label="Instagram Handle"
          id="edit-instagram"
          value={instagram}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInstagram(e.target.value)
          }
          required={false}
        />
        <div className="border-t border-black pt-4">
          <label className="flex cursor-pointer items-center space-x-3">
            <input
              type="checkbox"
              checked={hostingAvailability}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHostingAvailability(e.target.checked)
              }
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHostingCapacity(Number(e.target.value))
                }
                min="1"
                className="block border-2 border-black bg-white p-2 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
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
          <p className="mb-2 text-sm text-danger">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <button onClick={onDeactivate} className="btn-danger w-full">
            Delete My Account
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-4">
        <button onClick={onClose} className="btn-secondary w-full">
          Cancel
        </button>
        <button onClick={handleSubmit} className="btn-primary w-full">
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
