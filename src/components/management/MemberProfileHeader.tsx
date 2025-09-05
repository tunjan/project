import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types';

interface MemberProfileHeaderProps {
  user: User;
}

const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({ user }) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Avatar className="size-24 shrink-0 border">
            <AvatarImage
              src={user.profilePictureUrl}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="text-lg">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-foreground">
              {user.name}
            </h1>
            <p className="text-lg text-muted-foreground">{user.email}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Chapters:</span>{' '}
                {user.chapters?.join(', ') || 'None'}
              </p>
              {user.organiserOf && user.organiserOf.length > 0 && (
                <p className="text-sm text-primary">
                  <span className="font-semibold">Organizing:</span>{' '}
                  {user.organiserOf.join(', ')}
                </p>
              )}
              {user.instagram && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Instagram:</span>{' '}
                  <Button variant="link" asChild className="h-auto p-0">
                    <a
                      href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.instagram}
                    </a>
                  </Button>
                </p>
              )}
              {user.joinDate && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Member since:</span>{' '}
                  {new Date(user.joinDate).toLocaleDateString()}
                </p>
              )}
              {user.lastLogin && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Last login:</span>{' '}
                  {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <div className="text-right">
              <p className="text-sm font-bold text-muted-foreground">Role</p>
              <p className="text-lg font-bold text-foreground">{user.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-muted-foreground">Status</p>
              <p className="text-lg font-bold text-foreground">
                {user.onboardingStatus}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberProfileHeader;
