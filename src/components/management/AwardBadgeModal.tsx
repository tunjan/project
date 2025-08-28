import React, { useState } from 'react';
import { type User, type BadgeTemplate } from '@/types';
import Modal from '@/components/ui/Modal';
import { InputField, TextAreaField } from '@/components/ui/Form';
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
  const [awardType, setAwardType] = useState<'standard' | 'custom'>('standard');
  const [selectedBadge, setSelectedBadge] = useState<BadgeTemplate | null>(
    null
  );
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const customIcon = 'SparklesIcon'; // Use an existing icon for custom prizes.

  const userBadgeNames = new Set(userToAward.badges.map((b) => b.name));
  const availableBadges = BADGE_TEMPLATES.filter(
    (b) => !userBadgeNames.has(b.name)
  );

  const handleConfirm = () => {
    if (awardType === 'standard' && selectedBadge) {
      onConfirm(selectedBadge);
    } else if (awardType === 'custom' && customName.trim()) {
      onConfirm({
        name: customName.trim(),
        description: customDescription.trim(),
        icon: customIcon,
      });
    }
  };

  const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ isActive, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold ${
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-white hover:text-black'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Modal
      title={`Award Recognition to ${userToAward.name}`}
      description="Select a standard recognition or create a custom prize."
      onClose={onClose}
    >
      <div className="mb-4 border-b border-black">
        <TabButton
          isActive={awardType === 'standard'}
          onClick={() => {
            setAwardType('standard');
            setCustomName('');
            setCustomDescription('');
          }}
        >
          Standard Recognitions
        </TabButton>
        <TabButton
          isActive={awardType === 'custom'}
          onClick={() => {
            setAwardType('custom');
            setSelectedBadge(null);
          }}
        >
          Custom Prize
        </TabButton>
      </div>

      <div className="my-6 max-h-80 min-h-[180px] space-y-2 overflow-y-auto">
        {awardType === 'standard' ? (
          availableBadges.map((badge) => {
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
                    : 'border-black bg-white hover:bg-white'
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
                  <p className="text-sm text-red">
                    {badge.description}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="space-y-4 p-1">
            <InputField
              id="custom-name"
              label="Prize Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., 'Chapter MVP'"
              required
            />
            <TextAreaField
              id="custom-description"
              label="Description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g., For outstanding contributions in Q3."
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-black"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={
            (awardType === 'standard' && !selectedBadge) ||
            (awardType === 'custom' && !customName.trim())
          }
          className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Award Prize
        </button>
      </div>
    </Modal>
  );
};

export default AwardBadgeModal;
