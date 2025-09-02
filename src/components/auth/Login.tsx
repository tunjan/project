import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui';
import { Tag } from '@/components/ui';
import { can, Permission } from '@/config';
import {
  AcademicCapIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserAddIcon,
  UserGroupIcon,
} from '@/icons';
import { OnboardingStatus, Role, type User } from '@/types';

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
    openKey: 'organizers' | 'activists' | 'applicants';
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, count, openKey, icon, children }) => {
    const contentId = `section-${openKey}-content`;

    return (
      <div className="overflow-hidden border-black bg-white transition-all duration-300 dark:border-white dark:bg-black md:border-2">
        <button
          type="button"
          onClick={() => toggle(openKey)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-all duration-200 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-expanded={open[openKey]}
          aria-controls={contentId}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-primary-lightest text-primary">
              {icon}
            </div>
            <div>
              <p className="text-lg font-bold text-black">{title}</p>
              <p className="text-sm text-neutral-600">
                {count.toLocaleString()} profile{count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ChevronRightIcon
            className={`size-5 text-neutral-400 transition-transform duration-200 ${open[openKey] ? 'rotate-90' : ''}`}
          />
        </button>
        {open[openKey] && (
          <div
            id={contentId}
            className="border-t border-neutral-200 bg-neutral-50 px-6 pb-6 pt-4"
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
      className={`group flex w-full items-center gap-4 border-black md:border-2 ${borderClassFor(user)} bg-white p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white dark:bg-black`}
    >
      <Avatar
        src={user.profilePictureUrl}
        alt={user.name}
        className="size-14 border-black object-cover transition-transform duration-200 group-hover:scale-105 dark:border-white md:border-2"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-black transition-colors duration-200 group-hover:text-primary">
          {user.name}
        </p>
        <p className="truncate text-sm capitalize text-neutral-600">
          {user.role.replace('_', ' ').toLowerCase()}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end space-y-2">
        <ProgressTags user={user} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-white py-8 dark:bg-black md:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl">
            Welcome Back
          </h1>
        </div>

        {/* Main Login Container */}
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6">
            <Section
              title="Administrators & Organizers"
              count={groups.adminsAndOrganizers.length}
              openKey="organizers"
              icon={<ShieldCheckIcon className="size-5" />}
            >
              <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                {groups.adminsAndOrganizers.length > 0 ? (
                  groups.adminsAndOrganizers.map((u) => (
                    <UserButton key={u.id} user={u} />
                  ))
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    <ShieldCheckIcon className="mx-auto mb-2 size-8 text-neutral-300" />
                    <p>No administrators or organizers available</p>
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Active Activists"
              count={groups.activists.length}
              openKey="activists"
              icon={<UserGroupIcon className="size-5" />}
            >
              <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                {groups.activists.length > 0 ? (
                  groups.activists.map((u) => (
                    <UserButton key={u.id} user={u} />
                  ))
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    <UserGroupIcon className="mx-auto mb-2 size-8 text-neutral-300" />
                    <p>No active activists available</p>
                  </div>
                )}
              </div>
            </Section>

            <Section
              title="Applicants & Onboarding"
              count={groups.applicants.length}
              openKey="applicants"
              icon={<AcademicCapIcon className="size-5" />}
            >
              <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                {groups.applicants.length > 0 ? (
                  groups.applicants.map((u) => (
                    <UserButton key={u.id} user={u} />
                  ))
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    <AcademicCapIcon className="mx-auto mb-2 size-8 text-neutral-300" />
                    <p>No applicants in onboarding</p>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="border-black bg-white p-6 dark:border-white dark:bg-black md:border-2">
              <GlobeAltIcon className="mx-auto mb-3 size-8 text-primary" />
              <p className="mb-3 text-lg font-semibold text-black">
                New to the movement?
              </p>
              <p className="mb-4 text-sm text-neutral-600">
                Join thousands of activists making a difference in their
                communities
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-primary px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <UserAddIcon className="size-4" />
                Join the Movement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
