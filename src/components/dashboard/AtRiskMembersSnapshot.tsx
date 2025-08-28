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
    const visibleMembers = allUsers.filter(user => 
      currentUser.role === 'Global Admin' || 
      user.chapters?.some(c => currentUser.organiserOf?.includes(c))
    );

    // Filter for inactive members among the visible ones
    return visibleMembers.filter(user => isUserInactive(user, allEvents));
  }, [currentUser, allUsers, allEvents]);

  const handleSelectUser = (user: User) => {
    navigate(`/manage/member/${user.id}`);
  };

  if (atRiskMembers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-grey-600">
        <p>No at-risk members found. Great job!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
      {atRiskMembers.map(user => (
        <div 
          key={user.id} 
          className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleSelectUser(user)}
        >
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-grey-500">{user.chapters?.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default AtRiskMembersSnapshot;
