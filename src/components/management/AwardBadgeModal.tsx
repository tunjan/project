import React, { useState } from 'react';
import { type User, type BadgeTemplate } from '@/types';
import Modal from '@/components/ui/Modal';
import { BADGE_TEMPLATES } from '@/constants';
import * as Icons from '@/icons';

interface AwardBadgeModalProps {
  userToAward: User;
  onClose: () => void;
  onConfirm: (badge: BadgeTemplate) => void;
}

const AwardBadgeModal: React.FC<AwardBadgeModalProps> = ({
  userToAward,
  onClose,
  onConfirm,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeTemplate | null>(
    null
  );

  const userBadgeNames = new Set(userToAward.badges.map((b) => b.name));
  const availableBadges = BADGE_TEMPLATES.filter(
    (b) => !userBadgeNames.has(b.name)
  );

  const handleConfirm = () => {
    if (selectedBadge) {
      onConfirm(selectedBadge);
    }
  };

  return (
    <Modal
      title={`Award Badge to ${userToAward.name}`}
      description="Select a badge to recognize their contributions."
      onClose={onClose}
    >
      <div className="my-6 max-h-80 space-y-2 overflow-y-auto">
        {availableBadges.map((badge) => {
          const IconComponent =
            Icons[badge.icon as keyof typeof Icons] || Icons.TrophyIcon;
          const isSelected = selectedBadge?.name === badge.name;
          return (
            <button
              key={badge.name}
              onClick={() => setSelectedBadge(badge)}
              className={`flex w-full items-center space-x-4 border-2 p-3 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-black bg-white hover:bg-neutral-50'
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center ${
                  isSelected ? 'bg-primary text-white' : 'bg-black text-white'
                }`}
              >
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-black">{badge.name}</p>
                <p className="text-sm text-neutral-600">{badge.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <button
          onClick={onClose}
          className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedBadge}
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Award Badge
        </button>
      </div>
    </Modal>
  );
};

export default AwardBadgeModal;
