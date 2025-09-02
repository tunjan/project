import React from 'react';

import { Avatar } from '@/components/ui';
import { type User } from '@/types';

interface MemberCardProps {
  member: User;
  onMemberClick: (member: User) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onMemberClick }) => (
  <button
    type="button"
    onClick={() => onMemberClick(member)}
    className="flex w-full items-center space-x-3 p-2 text-left transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black"
  >
    <Avatar
      src={member.profilePictureUrl}
      alt={member.name}
      className="size-10 object-cover"
    />
    <div>
      <p className="font-bold text-black">{member.name}</p>
      <p className="text-sm text-neutral-500">{member.role}</p>
    </div>
  </button>
);

export default MemberCard;
