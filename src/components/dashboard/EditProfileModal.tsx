import { Users } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type User } from '@/types';

import { generateRandomAvatarUrl } from '../../utils/user';

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
    const newUrl = generateRandomAvatarUrl(150);
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal and hosting information.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Avatar className="size-20">
                <AvatarImage
                  src={profilePictureUrl}
                  alt="Profile avatar"
                  className="object-cover"
                />
                <AvatarFallback>Profile</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                onClick={handleGenerateAvatar}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Users className="size-4" />
                <span>New Avatar</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 Click on your avatar to upload a custom image, or use the "New
              Avatar" button for a random one.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-instagram">Instagram Handle</Label>
            <Input
              id="edit-instagram"
              value={instagram}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInstagram(e.target.value)
              }
            />
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hosting-availability"
                checked={hostingAvailability}
                onCheckedChange={(checked) =>
                  setHostingAvailability(checked as boolean)
                }
              />
              <Label
                htmlFor="hosting-availability"
                className="font-bold text-foreground"
              >
                I am available to host other activists
              </Label>
            </div>
            {hostingAvailability && (
              <div className="pl-6">
                <Label htmlFor="hosting-capacity" className="text-sm font-bold">
                  How many people can you host?
                </Label>
                <Input
                  type="number"
                  id="hosting-capacity"
                  value={hostingCapacity}
                  onChange={(e) => setHostingCapacity(Number(e.target.value))}
                  min="1"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <Separator />
        <div className="space-y-4 border-l-4 border-destructive pl-4">
          <h3 className="font-extrabold text-foreground">Danger Zone</h3>
          <div>
            <p className="text-sm font-bold text-foreground">
              Deactivate Account
            </p>
            <p className="mb-2 text-sm text-destructive">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <Button
              onClick={onDeactivate}
              variant="destructive"
              className="w-full"
            >
              Delete My Account
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
