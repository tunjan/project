import { Building, MessageSquare, Star, Users } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, User } from '@/types';

interface UserManagementPanelProps {
  user: User;
  currentUser: User;
  canEditChapters: boolean;
  canAwardBadges: boolean;
  onUpdateRole: (userId: string, newRole: Role) => void;
  onSetChapterOrganiser: (
    userId: string,
    chapterName: string,
    isOrganiser: boolean
  ) => void;
  onOpenPromoteModal: () => void;
  onOpenEditChaptersModal: () => void;
  onOpenAwardBadgeModal: () => void;
  onSendMessage: (userId: string) => void;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  user,
  canEditChapters,
  canAwardBadges,
  onOpenPromoteModal,
  onOpenEditChaptersModal,
  onOpenAwardBadgeModal,
  onSendMessage,
}) => {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
        User Management
      </h2>
      <div className="space-y-4">
        {/* Role Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Role Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current Role:{' '}
              <span className="font-bold text-foreground">{user.role}</span>
            </p>
            <Button onClick={onOpenPromoteModal} className="w-full">
              Promote to Organiser
            </Button>
          </CardContent>
        </Card>

        {/* Chapter Management */}
        {canEditChapters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                Chapter Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Chapters:{' '}
                <span className="font-bold text-foreground">
                  {user.chapters?.join(', ') || 'None'}
                </span>
              </p>
              <Button onClick={onOpenEditChaptersModal} className="w-full">
                Edit Chapters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recognition Management */}
        {canAwardBadges && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5" />
                Recognition Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current Recognitions:{' '}
                <span className="font-bold text-foreground">
                  {user.badges?.length || 0}
                </span>
              </p>
              <Button onClick={onOpenAwardBadgeModal} className="w-full">
                Award Recognition
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onSendMessage(user.id)} className="w-full">
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UserManagementPanel;
