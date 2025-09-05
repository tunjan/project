import { ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  pendingRequests?: ChapterJoinRequest[];
}

const MemberRow: React.FC<{
  user: User;
  onSelectUser: (user: User) => void;
  isPendingForCurrentChapter?: boolean;
}> = ({ user, onSelectUser, isPendingForCurrentChapter }) => {
  const chapterText =
    user.chapters && user.chapters.length > 0
      ? `${user.chapters.join(', ')} Chapter(s)`
      : 'No chapter';

  return (
    <Button
      variant="ghost"
      onClick={() => onSelectUser(user)}
      className="group flex h-auto w-full items-center justify-between p-4 text-left"
    >
      <div className="flex items-center space-x-4">
        <Avatar className="size-10">
          <AvatarImage
            src={user.profilePictureUrl}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-foreground transition-colors group-hover:text-primary">
            {user.name}
          </p>
          <p className="text-sm text-muted-foreground">{chapterText}</p>
          {isPendingForCurrentChapter && (
            <Badge variant="secondary" className="mt-1">
              ⏳ Pending Chapter Join Request
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE && (
          <Badge variant="default" className="hidden sm:block">
            AWAITING FIRST CUBE
          </Badge>
        )}
        <span className="hidden text-sm font-semibold text-foreground md:block">
          {user.role}
        </span>
        <ChevronRight className="size-5 text-primary transition-colors group-hover:text-foreground" />
      </div>
    </Button>
  );
};

const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  members,
  onSelectUser,
  filterableChapters,
  pendingRequests = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<
    OnboardingStatus | 'all'
  >('all');

  const filteredMembers = useMemo(() => {
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

        const isAlreadyMember = user.chapters?.includes(selectedChapter);

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
    <Card>
      <CardHeader>
        <CardTitle>Member Directory</CardTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {filterableChapters.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="chapter-filter">Chapter</Label>
              <Select
                value={selectedChapter}
                onValueChange={setSelectedChapter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {filterableChapters.map((chapter) => (
                    <SelectItem key={chapter.name} value={chapter.name}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as Role | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(Role).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as OnboardingStatus | 'all')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(OnboardingStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg bg-muted p-3 text-center text-sm font-medium">
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
            <div className="space-y-1">
              {filteredMembers.map((user) => {
                const isPendingForCurrentChapter = pendingRequests.some(
                  (req) =>
                    req.user.id === user.id &&
                    req.status === 'Pending' &&
                    (selectedChapter === 'all' ||
                      req.chapterName === selectedChapter)
                );
                return (
                  <div key={user.id}>
                    <MemberRow
                      user={user}
                      onSelectUser={onSelectUser}
                      isPendingForCurrentChapter={isPendingForCurrentChapter}
                    />
                    <Separator />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="text-lg font-bold text-foreground">
              No members found.
            </p>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filter selection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberDirectory;
