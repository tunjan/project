import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type User, Role, OnboardingStatus } from '@/types';
import { can, Permission } from '@/config/permissions';
import Tag from '@/components/ui/Tag';
import { ChevronRightIcon } from '@/icons';
import Avatar from '@/components/ui/Avatar';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  organizers: User[]; // kept for backward compatibility (not required for grouping)
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

  // Accordion state
  const [open, setOpen] = useState<{ [key: string]: boolean }>(() => ({
    organizers: true,
    activists: false,
    applicants: false,
  }));

  const toggle = (key: 'organizers' | 'activists' | 'applicants') =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  const borderClassFor = (u: User) => {
    if (
      u.role === Role.GLOBAL_ADMIN ||
      u.role === Role.REGIONAL_ORGANISER ||
      u.role === Role.CHAPTER_ORGANISER
    )
      return 'border-l-4 border-primary';

    if (u.onboardingStatus === OnboardingStatus.CONFIRMED)
      return 'border-l-4 border-success';

    // Emphasize actionable onboarding states
    if (
      u.onboardingStatus === OnboardingStatus.AWAITING_FIRST_CUBE ||
      u.onboardingStatus === OnboardingStatus.AWAITING_MASTERCLASS ||
      u.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
    )
      return 'border-l-4 border-warning';

    // Softer color for earlier pipeline stages
    return 'border-l-4 border-neutral-400';
  };

  const ProgressTags: React.FC<{ user: User }> = ({ user }) => {
    const p = user.onboardingProgress || {};
    const tags: React.ReactNode[] = [];

    // Organizer tag if applicable
    if (can(user, Permission.VIEW_MANAGEMENT_DASHBOARD)) {
      tags.push(
        <Tag key="org" variant="primary" size="sm">
          ORGANIZER
        </Tag>
      );
    }

    // Show onboarding status for non-organizers
    if (
      user.role !== Role.GLOBAL_ADMIN &&
      user.role !== Role.REGIONAL_ORGANISER &&
      user.role !== Role.CHAPTER_ORGANISER &&
      user.onboardingStatus !== OnboardingStatus.CONFIRMED
    ) {
      tags.push(
        <Tag key="status" variant="warning" size="sm">
          {user.onboardingStatus}
        </Tag>
      );

      // Progress cues
      if (p.watchedMasterclass) {
        tags.push(
          <Tag key="mc" variant="success" size="sm">
            Masterclass ✓
          </Tag>
        );
      }

      if (p.revisionCallScheduledAt) {
        tags.push(
          <Tag key="rev" variant="primary" size="sm">
            Revision scheduled
          </Tag>
        );
      } else if (
        user.onboardingStatus === OnboardingStatus.AWAITING_REVISION_CALL
      ) {
        tags.push(
          <Tag key="sched" variant="warning" size="sm">
            Schedule revision
          </Tag>
        );
      }
    }

    return <>{tags}</>;
  };

  const Section: React.FC<{
    title: string;
    count: number;
    openKey: 'organizers' | 'activists' | 'applicants'; // FIX: Updated type to match actual usage
    children: React.ReactNode;
  }> = ({ title, count, openKey, children }) => {
    const contentId = `section-${openKey}-content`;

    return (
      <div className="border-2 border-black bg-white">
        <button
          type="button"
          onClick={() => toggle(openKey)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-100"
          aria-expanded={open[openKey]}
          aria-controls={contentId}
        >
          <div>
            <p className="font-extrabold">{title}</p>
            <p className="text-xs text-neutral-600">
              {count.toLocaleString()} profiles
            </p>
          </div>
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform ${open[openKey] ? 'rotate-90' : ''}`}
          />
        </button>
        {open[openKey] && (
          <div
            id={contentId}
            className="px-3 pb-3"
            role="region"
            aria-label={`${title} profiles`}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  const UserButton: React.FC<{ user: User }> = ({ user }) => (
    <button
      key={user.id}
      onClick={() => onLogin(user)}
      className={`flex w-full items-center gap-4 border-2 border-black ${borderClassFor(user)} bg-white p-3 text-left transition-colors duration-200 hover:bg-neutral-100`}
    >
      <Avatar
        src={user.profilePictureUrl}
        alt={user.name}
        className="h-12 w-12 border-2 border-black object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-black">{user.name}</p>
        {/* FIX: role text was white on white; use subtle grey */}
        <p className="truncate text-sm text-neutral-600">{user.role}</p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end space-y-1">
        <ProgressTags user={user} />
      </div>
    </button>
  );

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl border-2 border-black bg-white p-6 md:p-8">
        {/* Branding/Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-black">
            Log In
          </h1>
          <p className="mt-1 text-sm font-semibold text-neutral-700">
            The central hub for activists
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Select a profile to simulate logging in.
          </p>
        </div>

        <div className="space-y-3">
          <Section
            title="Administrators & Organizers"
            count={groups.adminsAndOrganizers.length}
            openKey="organizers"
          >
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {groups.adminsAndOrganizers.map((u) => (
                <UserButton key={u.id} user={u} />
              ))}
            </div>
          </Section>

          <Section
            title="Activists"
            count={groups.activists.length}
            openKey="activists"
          >
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {groups.activists.map((u) => (
                <UserButton key={u.id} user={u} />
              ))}
            </div>
          </Section>

          <Section
            title="Applicants / Onboarding"
            count={groups.applicants.length}
            openKey="applicants"
          >
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {groups.applicants.map((u) => (
                <UserButton key={u.id} user={u} />
              ))}
            </div>
          </Section>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-700">
          New here?{' '}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Join the movement
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
