import React, { useMemo, useState } from 'react';

import Avatar from '@/components/ui/Avatar';
import { SelectField } from '@/components/ui/Form';
import { ChevronRightIcon, SearchIcon } from '@/icons';
import {
  type Chapter,
  type ChapterJoinRequest,
  OnboardingStatus,
  Role,
  type User,
} from '@/types';

interface MemberDirectoryProps {
  members: User[];
  onSelectUser: (user: User) => void;
  filterableChapters: Chapter[];
  pendingRequests?: ChapterJoinRequest[]; // New prop for pending chapter join requests
}

const MemberRow: React.FC<{
  user: User;
  onSelectUser: (user: User) => void;
  isPendingForCurrentChapter?: boolean; // New prop to show pending status
}> = ({ user, onSelectUser, isPendingForCurrentChapter }) => {
  const chapterText =
    user.chapters && user.chapters.length > 0
      ? `${user.chapters.join(', ')} Chapter(s)`
      : 'No chapter';

  return (
    <button
      onClick={() => onSelectUser(user)}
      className="group flex w-full items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-neutral-100"
    >
      <div className="flex items-center space-x-4">
        <Avatar
          src={user.profilePictureUrl}
          alt={user.name}
          className="size-10 object-cover"
        />
        <div>
          <p className="font-bold text-black transition-colors group-hover:text-primary">
            {user.name}
          </p>
          <p className="text-sm text-neutral-500">{chapterText}</p>
          {isPendingForCurrentChapter && (
            <p className="text-xs font-medium text-warning">
              ⏳ Pending Chapter Join Request
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE && (
          <span className="hidden bg-warning px-2 py-1 text-xs font-bold text-white sm:block">
            AWAITING FIRST CUBE
          </span>
        )}
        <span className="hidden text-sm font-semibold text-black md:block">
          {user.role}
        </span>
        <ChevronRightIcon className="size-5 text-primary transition-colors group-hover:text-black" />
      </div>
    </button>
  );
};

const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onSelectUser,
  filterableChapters,
  pendingRequests = [], // Default to empty array
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    OnboardingStatus | 'all'
  >('all');

  // ✨ PERFORMANCE OPTIMIZATION: Memoize the filtered members list
  const filteredMembers = useMemo(() => {
    // Combine members with pending request users
    const allUsers = [
      ...members,
      ...pendingRequests
        .filter((req) => req.status === 'Pending')
        .map((req) => req.user),
    ];

    return allUsers
      .filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((user) => {
        if (selectedChapter === 'all') return true;

        // Check if user is already a member of the selected chapter
        const isAlreadyMember = user.chapters?.includes(selectedChapter);

        // Check if there's a pending request for this user and chapter
        const hasPendingRequestForChapter = pendingRequests.some(
          (req) =>
            req.user.id === user.id &&
            req.chapterName === selectedChapter &&
            req.status === 'Pending'
        );

        return isAlreadyMember || hasPendingRequestForChapter;
      })
      .filter((user) => {
        if (selectedRole === 'all') return true;
        return user.role === selectedRole;
      })
      .filter((user) => {
        if (selectedStatus === 'all') return true;
        return user.onboardingStatus === selectedStatus;
      });
  }, [
    members,
    searchTerm,
    selectedChapter,
    selectedRole,
    selectedStatus,
    pendingRequests,
  ]);

  return (
    <div className="border-2 border-black bg-white">
      <div className="border-b-2 border-black p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="size-5 text-primary" />
              </div>
              <input
                type="text"
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-nonenone block w-full border border-black bg-white p-2 pl-10 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
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
      <div className="border-b-2 border-black bg-neutral-100 p-2 text-center text-sm font-semibold">
        <p>
          Showing {filteredMembers.length} of{' '}
          {members.length +
            pendingRequests.filter((req) => req.status === 'Pending')
              .length}{' '}
          members
        </p>
      </div>
      {filteredMembers.length > 0 ? (
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="divide-y-2 divide-black">
            {filteredMembers.map((user) => {
              const isPendingForCurrentChapter = pendingRequests.some(
                (req) =>
                  req.user.id === user.id &&
                  req.status === 'Pending' &&
                  (selectedChapter === 'all' ||
                    req.chapterName === selectedChapter)
              );
              return (
                <MemberRow
                  key={user.id}
                  user={user}
                  onSelectUser={onSelectUser}
                  isPendingForCurrentChapter={isPendingForCurrentChapter}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center">
          <p className="text-lg font-bold">No members found.</p>
          <p className="mt-2 text-neutral-600">
            Try adjusting your search or filter selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
