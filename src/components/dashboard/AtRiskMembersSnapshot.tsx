import React, { useMemo } from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { useUsers, useEvents } from '@/store';
import { isUserInactive } from '@/utils/user';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

const AtRiskMembersSnapshot: React.FC = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allEvents = useEvents();
  const navigate = useNavigate();

  const atRiskMembers = useMemo(() => {
    if (!currentUser) return [];

    // Determine the members this user can see
    const visibleMembers = allUsers.filter(
      (user) =>
        currentUser.role === 'Global Admin' ||
        user.chapters?.some((c) => currentUser.organiserOf?.includes(c))
    );

    // Filter for inactive members among the visible ones
    return visibleMembers.filter((user) => isUserInactive(user, allEvents));
  }, [currentUser, allUsers, allEvents]);

  const handleSelectUser = (user: User) => {
    navigate(`/manage/member/${user.id}`);
  };

  if (atRiskMembers.length === 0) {
    return (
      <div className="text-grey-600 flex h-full items-center justify-center text-center">
        <p>No at-risk members found. Great job!</p>
      </div>
    );
  }

  return (
    <div className="divide-y-2 divide-black overflow-y-auto" style={{ maxHeight: '300px' }}>
      {atRiskMembers.map((user) => (
        <button
          key={user.id}
          className="flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors hover:bg-primary-lightest"
          onClick={() => handleSelectUser(user)}
        >
          <div className="flex items-center gap-3">
            <img src={user.profilePictureUrl} alt={user.name} className="h-8 w-8 object-cover" />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-neutral-500">
                Last login: {new Date(user.lastLogin).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-600">{user.chapters?.join(', ')}</p>
        </button>
      ))}
    </div>
  );
};

export default AtRiskMembersSnapshot;
