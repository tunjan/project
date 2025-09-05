import {
  Globe,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OnboardingStatus, Role, type User } from '@/types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  // Helper to determine organizer
  const isOrganizer = (u: User) =>
    u.role === Role.GLOBAL_ADMIN ||
    u.role === Role.REGIONAL_ORGANISER ||
    u.role === Role.CHAPTER_ORGANISER;

  // Group users for quicker scanning
  const groups = useMemo(() => {
    const adminsAndOrganizers = users.filter(isOrganizer);
    const activists = users.filter(
      (u) => !isOrganizer(u) && u.role === Role.ACTIVIST
    );
    const applicants = users.filter(
      (u) => !isOrganizer(u) && u.role === Role.APPLICANT
    );

    return {
      adminsAndOrganizers,
      activists,
      applicants,
    };
  }, [users]);

  const getStatusBadgeVariant = (u: User) => {
    if (
      u.role === Role.GLOBAL_ADMIN ||
      u.role === Role.REGIONAL_ORGANISER ||
      u.role === Role.CHAPTER_ORGANISER
    )
      return 'default';

    if (u.onboardingStatus === OnboardingStatus.CONFIRMED) return 'default';

    // Emphasize actionable onboarding states
    if (
      u.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE ||
      u.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS ||
      u.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
    )
      return 'secondary';

    // Softer color for earlier pipeline stages
    return 'outline';
  };

  const ProgressTags: React.FC<{ user: User }> = ({ user }) => {
    const p = user.onboardingProgress || {};
    const tags: React.ReactNode[] = [];

    // Status badge based on role/onboarding status
    if (
      user.role === Role.GLOBAL_ADMIN ||
      user.role === Role.REGIONAL_ORGANISER ||
      user.role === Role.CHAPTER_ORGANISER
    ) {
      tags.push(
        <Badge key="role" variant="default">
          ORGANIZER
        </Badge>
      );
    } else if (user.onboardingStatus === OnboardingStatus.CONFIRMED) {
      tags.push(
        <Badge key="status" variant="default">
          CONFIRMED
        </Badge>
      );
    } else if (
      user.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE ||
      user.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS ||
      user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
    ) {
      tags.push(
        <Badge key="status" variant={getStatusBadgeVariant(user)}>
          {user.onboardingStatus.replace(/_/g, ' ')}
        </Badge>
      );
    } else {
      tags.push(
        <Badge key="status" variant="outline">
          {user.onboardingStatus.replace(/_/g, ' ')}
        </Badge>
      );
    }

    // Progress cues
    if (p.watchedMasterclass) {
      tags.push(
        <Badge key="mc" variant="default">
          Masterclass ✓
        </Badge>
      );
    }

    if (p.revisionCallScheduledAt) {
      tags.push(
        <Badge key="rev" variant="default">
          Revision scheduled
        </Badge>
      );
    } else if (
      user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
    ) {
      tags.push(
        <Badge key="sched" variant="secondary">
          Schedule revision
        </Badge>
      );
    }

    return <>{tags}</>;
  };

  const UserButton: React.FC<{ user: User }> = ({ user }) => (
    <Card
      key={user.id}
      className="cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={() => onLogin(user)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={user.profilePictureUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-sm capitalize text-muted-foreground">
              {user.role.replace('_', ' ').toLowerCase()}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end space-y-2">
            <ProgressTags user={user} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select your profile to continue
          </p>
        </div>
        <Separator className="mb-8" />

        {/* Main Login Container */}
        <div className="mx-auto max-w-3xl">
          <Accordion
            type="multiple"
            defaultValue={['organizers']}
            className="space-y-4"
          >
            <AccordionItem value="organizers" className="rounded-lg border">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-foreground">
                      Administrators & Organizers
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {groups.adminsAndOrganizers.length.toLocaleString()}{' '}
                      profile
                      {groups.adminsAndOrganizers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                  {groups.adminsAndOrganizers.length > 0 ? (
                    groups.adminsAndOrganizers.map((u) => (
                      <UserButton key={u.id} user={u} />
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <ShieldCheck className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                      <p>No administrators or organizers available</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="activists" className="rounded-lg border">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-foreground">
                      Active Activists
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {groups.activists.length.toLocaleString()} profile
                      {groups.activists.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                  {groups.activists.length > 0 ? (
                    groups.activists.map((u) => (
                      <UserButton key={u.id} user={u} />
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Users className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                      <p>No active activists available</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="applicants" className="rounded-lg border">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-foreground">
                      Applicants & Onboarding
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {groups.applicants.length.toLocaleString()} profile
                      {groups.applicants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                  {groups.applicants.length > 0 ? (
                    groups.applicants.map((u) => (
                      <UserButton key={u.id} user={u} />
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <GraduationCap className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                      <p>No applicants in onboarding</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card>
              <CardContent className="p-8">
                <Globe className="mx-auto mb-3 size-8 text-primary" />
                <p className="mb-3 text-lg font-semibold text-foreground">
                  New to the movement?
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Join thousands of activists making a difference in their
                  communities
                </p>
                <Button asChild>
                  <Link to="/signup" className="inline-flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Join the Movement
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
