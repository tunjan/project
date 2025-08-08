import React, { useState } from 'react';
import { type User, type Chapter, Role, OnboardingStatus } from '@/types';
import { SearchIcon, ChevronRightIcon } from '@/icons';
import { SelectField } from '@/components/ui/Form';

interface MemberDirectoryProps {
  members: User[];
  onSelectUser: (user: User) => void;
  filterableChapters: Chapter[];
}

const MemberRow: React.FC<{
  user: User;
  onSelectUser: (user: User) => void;
}> = ({ user, onSelectUser }) => {
  const chapterText =
    user.chapters.length > 0
      ? `${user.chapters.join(', ')} Chapter(s)`
      : 'No chapter';

  return (
    <button
      onClick={() => onSelectUser(user)}
      className="group flex w-full items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-neutral-100"
    >
      <div className="flex items-center space-x-4">
        <img
          src={user.profilePictureUrl}
          alt={user.name}
          className="h-10 w-10 object-cover"
        />
        <div>
          <p className="font-bold text-black transition-colors group-hover:text-primary">
            {user.name}
          </p>
          <p className="text-sm text-neutral-500">{chapterText}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user.onboardingStatus === 'Awaiting Verification' && (
          <span className="hidden bg-yellow-400 px-2 py-1 text-xs font-bold text-black sm:block">
            AWAITING VERIFICATION
          </span>
        )}
        <span className="hidden text-sm font-semibold text-black md:block">
          {user.role}
        </span>
        <ChevronRightIcon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-black" />
      </div>
    </button>
  );
};

const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onSelectUser,
  filterableChapters,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    OnboardingStatus | 'all'
  >('all');

  const filteredMembers = members
    .filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((member) => {
      if (selectedChapter === 'all') return true;
      return member.chapters.includes(selectedChapter);
    })
    .filter((member) => {
      if (selectedRole === 'all') return true;
      return member.role === selectedRole;
    })
    .filter((member) => {
      if (selectedStatus === 'all') return true;
      return member.onboardingStatus === selectedStatus;
    });

  return (
    <div className="border border-black bg-white">
      <div className="border-b border-black p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-none border border-neutral-300 bg-white p-2 pl-10 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
              />
            </div>
          </div>
          {filterableChapters.length > 0 && (
            <SelectField
              label="Chapter"
              id="chapter-filter"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
            >
              <option value="all">All Chapters</option>
              {filterableChapters.map((chapter) => (
                <option key={chapter.name} value={chapter.name}>
                  {chapter.name}
                </option>
              ))}
            </SelectField>
          )}
          <SelectField
            label="Role"
            id="role-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role | 'all')}
          >
            <option value="all">All Roles</option>
            {Object.values(Role).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Status"
            id="status-filter"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as OnboardingStatus | 'all')
            }
          >
            <option value="all">All Statuses</option>
            {Object.values(OnboardingStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
      {filteredMembers.length > 0 ? (
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="divide-y divide-black">
            {filteredMembers.map((user) => (
              <MemberRow
                key={user.id}
                user={user}
                onSelectUser={onSelectUser}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center">
          <p className="text-lg font-bold">No members found.</p>
          <p className="mt-2 text-neutral-500">
            Try adjusting your search or filter selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
