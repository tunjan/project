import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useChapters, useEvents, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { User } from '@/types';
import { isUserInactive } from '@/utils';

const AtRiskMembersSnapshot: React.FC = () => {
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allChapters = useChapters();
  const navigate = useNavigate();

  const atRiskMembers = useMemo(() => {
    if (!currentUser) return [];

    return allUsers.filter((user) => {
      const isVisible =
        currentUser.role === 'Global Admin' ||
        user.chapters?.some((c) => currentUser.organiserOf?.includes(c)) ||
        (currentUser.role === 'Regional Organiser' &&
          currentUser.managedCountry &&
          allChapters.some(
            (chapter) =>
              user.chapters?.includes(chapter.name) &&
              chapter.country === currentUser.managedCountry
          ));

      if (!isVisible) return false;

      return isUserInactive(user, allEvents);
    });
  }, [currentUser, allUsers, allEvents, allChapters]);

  const handleSelectUser = (user: User) => {
    navigate(`/manage/member/${user.id}`);
  };

  if (atRiskMembers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-muted-foreground">
        <p>No at-risk members found. Great job!</p>
      </div>
    );
  }

  return (
    <div
      className="divide-y divide-border overflow-y-auto"
      style={{ maxHeight: '300px' }}
    >
      {atRiskMembers.map((user) => (
        <Button
          key={user.id}
          variant="ghost"
          className="flex h-auto w-full cursor-pointer justify-between p-3"
          onClick={() => handleSelectUser(user)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={user.profilePictureUrl}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                Last login: {new Date(user.lastLogin).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {user.chapters?.join(', ')}
          </p>
        </Button>
      ))}
    </div>
  );
};

export default AtRiskMembersSnapshot;
