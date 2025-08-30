import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ChapterMap from '@/components/chapters/ChapterMap';
import { BuildingOfficeIcon, CalendarIcon, ChevronRightIcon } from '@/icons';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { type Chapter, EventStatus } from '@/types';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Public stats directly from stores (works without auth)
  const users = useUsers();
  const events = useEvents();
  const chapters = useChapters();
  const outreachLogs = useOutreachLogs();

  const stats = useMemo(() => {
    const totalMembers = users.length;
    const eventsHeld = events.filter(
      (e) => e.status === EventStatus.FINISHED
    ).length;
    const conversationsLogged = outreachLogs.length;
    return { totalMembers, eventsHeld, conversationsLogged };
  }, [users.length, events, outreachLogs.length]);

  const handleSelectChapter = (chapter: Chapter) => {
    navigate('/signup', { state: { chapter: chapter.name } });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="rounded-nonenone mb-12 border-2 border-black bg-neutral-100 p-6 shadow-brutal">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="h-card mb-2">Join the Movement</h1>
            <p className="max-w-2xl text-neutral-800">
              Organize and attend impactful Cubes worldwide. Track events, grow
              your chapter, and amplify animal rights together.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="btn-secondary inline-flex items-center"
            >
              Login <ChevronRightIcon className="ml-2 size-4" />
            </Link>
            <Link to="/signup" className="btn-primary inline-flex items-center">
              Join the Hub <ChevronRightIcon className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-extrabold">Global Impact</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-2 border-black bg-white p-4">
            <p className="text-sm text-neutral-700">Total Members</p>
            <p className="mt-1 text-3xl font-extrabold">
              {stats.totalMembers.toLocaleString()}
            </p>
          </div>
          <div className="border-2 border-black bg-white p-4">
            <p className="text-sm text-neutral-700">Events Held</p>
            <p className="mt-1 text-3xl font-extrabold">
              {stats.eventsHeld.toLocaleString()}
            </p>
          </div>
          <div className="border-2 border-black bg-white p-4">
            <p className="text-sm text-neutral-700">Conversations Logged</p>
            <p className="mt-1 text-3xl font-extrabold">
              {stats.conversationsLogged.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="mb-12">
        <div className="mb-3 flex items-center gap-2">
          <BuildingOfficeIcon className="size-5 text-primary" />
          <h2 className="text-2xl font-extrabold">Our Chapters</h2>
        </div>
        <div className="mb-3 text-sm text-neutral-700">
          Explore our global chapters. Click a marker to request to join.
        </div>
        <ChapterMap
          chapters={chapters}
          onSelectChapter={handleSelectChapter}
          popupActionText="Request to Join"
        />
      </section>

      {/* Benefits for Activists */}
      <section className="rounded-nonenone mb-12 border-2 border-black bg-white p-6 shadow-brutal">
        <div className="mb-4 flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <h2 className="text-2xl font-extrabold">Why Join?</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-nonenone border-2 border-black bg-neutral-100 p-4">
            <p className="font-semibold">Find and join events</p>
            <p className="text-sm text-neutral-700">
              Discover cubes near you and RSVP with one click.
            </p>
          </li>
          <li className="rounded-nonenone border-2 border-black bg-neutral-100 p-4">
            <p className="font-semibold">Track your impact</p>
            <p className="text-sm text-neutral-700">
              Log conversations and see your growth over time.
            </p>
          </li>
          <li className="rounded-nonenone border-2 border-black bg-neutral-100 p-4">
            <p className="font-semibold">Build your chapter</p>
            <p className="text-sm text-neutral-700">
              Manage members, announcements, and resources.
            </p>
          </li>
          <li className="rounded-nonenone border-2 border-black bg-neutral-100 p-4">
            <p className="font-semibold">Global community</p>
            <p className="text-sm text-neutral-700">
              Connect with activists around the world.
            </p>
          </li>
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="btn-secondary inline-flex items-center justify-center"
          >
            Login <ChevronRightIcon className="ml-2 size-4" />
          </Link>
          <Link
            to="/signup"
            className="btn-primary inline-flex items-center justify-center"
          >
            Join the Hub <ChevronRightIcon className="ml-2 size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
