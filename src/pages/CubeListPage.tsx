import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CubeCard from '@/components/CubeCard';
import CubeMap from '@/components/CubeMap';
import { can, Permission } from '@/config';
import { ListBulletIcon, MapIcon, PlusIcon, SearchIcon } from '@/icons';
import { useChapters, useEvents } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Chapter, type CubeEvent } from '@/types';

type CubesView = 'list' | 'map';
type EventTimeView = 'upcoming' | 'past';

const ViewToggleButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex min-h-[44px] flex-1 items-center justify-center space-x-1 border px-3 py-2.5 text-xs font-semibold sm:flex-initial sm:space-x-2 sm:px-3 sm:py-2 sm:text-sm ${
      isActive
        ? 'border-black bg-black text-white'
        : 'border-black bg-white text-black hover:bg-gray-50 active:bg-gray-100'
    } touch-manipulation transition-colors duration-200`}
  >
    {children}
  </button>
);

const CubeListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allEvents = useEvents();
  const chapters = useChapters();

  const [cubesView, setCubesView] = useState<CubesView>('list');
  const [eventTimeView, setEventTimeView] = useState<EventTimeView>('upcoming');
  const [selectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const eventsToDisplay = useMemo(() => {
    const now = new Date();
    const userChapterNames = new Set(currentUser?.chapters || []);
    const userOrganiserOf = new Set(currentUser?.organiserOf || []);

    const isUserAffiliated = (city: string) => {
      return userChapterNames.has(city) || userOrganiserOf.has(city);
    };

    return allEvents
      .filter((e: CubeEvent) => {
        const isEventInPast = new Date(e.startDate) < now;
        const timeMatch =
          eventTimeView === 'past' ? isEventInPast : !isEventInPast;

        const chapterOfEvent = chapters.find((c: Chapter) => c.name === e.city);
        const regionMatch =
          selectedRegion === 'all' ||
          chapterOfEvent?.country === selectedRegion;

        const searchMatch =
          searchTerm === '' ||
          e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.location.toLowerCase().includes(searchTerm.toLowerCase());

        return timeMatch && regionMatch && searchMatch;
      })
      .sort((a: CubeEvent, b: CubeEvent) => {
        const aAffiliated = isUserAffiliated(a.city);
        const bAffiliated = isUserAffiliated(b.city);

        if (aAffiliated && !bAffiliated) return -1;
        if (!aAffiliated && bAffiliated) return 1;

        return eventTimeView === 'past'
          ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          : new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [
    allEvents,
    chapters,
    eventTimeView,
    selectedRegion,
    searchTerm,
    currentUser,
  ]);

  const handleSelectCube = useCallback(
    (event: CubeEvent) => {
      navigate(`/cubes/${event.id}`);
    },
    [navigate]
  );

  const handleCreateCube = useCallback(() => {
    navigate('/cubes/create');
  }, [navigate]);

  return (
    <div className="py-4 sm:py-6 md:py-8 lg:py-12">
      {/* Enhanced Header Section */}
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-2 bg-primary"></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {eventTimeView === 'upcoming' ? 'Upcoming Cubes' : 'Past Cubes'}
            </h1>
          </div>
          <p className="max-w-3xl px-2 text-base leading-relaxed text-neutral-600 sm:px-0 sm:text-xl">
            Discover and join impactful cube events in your area. Connect with
            fellow activists and make a difference.
          </p>
        </div>
        {currentUser && can(currentUser, Permission.CREATE_EVENT) && (
          <div className="w-full shrink-0 self-end sm:w-fit">
            <button
              onClick={handleCreateCube}
              className="flex w-full items-center justify-center bg-primary px-4 py-3 font-bold text-white transition-colors duration-200 hover:bg-primary-hover sm:w-auto sm:py-2"
            >
              <PlusIcon className="mr-2 size-4 sm:size-5" />
              Create Cube
            </button>
          </div>
        )}
      </div>

      {/* Mobile-first controls layout */}
      <div className="space-y-4 sm:mb-6 sm:flex sm:flex-col sm:gap-4 sm:space-y-0 md:flex-row md:items-center md:justify-between">
        {/* Time View Toggle - Full width on mobile */}
        <div className="flex w-full justify-center sm:justify-start md:w-auto">
          <div className="flex w-full items-center border border-black dark:border-white sm:w-auto">
            <ViewToggleButton
              onClick={() => setEventTimeView('upcoming')}
              isActive={eventTimeView === 'upcoming'}
            >
              <span>Upcoming</span>
            </ViewToggleButton>
            <ViewToggleButton
              onClick={() => setEventTimeView('past')}
              isActive={eventTimeView === 'past'}
            >
              <span>Past</span>
            </ViewToggleButton>
          </div>
        </div>

        {/* Search Input - Full width on mobile */}
        <div className="relative w-full md:w-80 lg:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="text-grey-500 size-4 sm:size-5" />
          </div>
          <input
            type="text"
            placeholder="Search by chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="placeholder:text-grey-500 block w-full border-black bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-black placeholder:font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-white dark:bg-black dark:text-white sm:py-2 sm:pl-10 md:border-2"
          />
        </div>

        {/* View Toggle - Full width on mobile */}
        <div className="flex w-full justify-center sm:justify-start md:w-auto">
          <div className="flex w-full items-center border border-black dark:border-white sm:w-auto">
            <ViewToggleButton
              onClick={() => setCubesView('list')}
              isActive={cubesView === 'list'}
            >
              <ListBulletIcon className="size-4 sm:size-5" />
              <span className="xs:inline hidden sm:hidden md:inline">List</span>
            </ViewToggleButton>
            <ViewToggleButton
              onClick={() => setCubesView('map')}
              isActive={cubesView === 'map'}
            >
              <MapIcon className="size-4 sm:size-5" />
              <span className="xs:inline hidden sm:hidden md:inline">Map</span>
            </ViewToggleButton>
          </div>
        </div>
      </div>

      {eventsToDisplay.length > 0 ? (
        cubesView === 'list' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {eventsToDisplay.map((event, index) => {
              const isAffiliated =
                !!currentUser &&
                (currentUser.chapters?.includes(event.city) ||
                  currentUser.organiserOf?.includes(event.city));
              return (
                <div key={event.id}>
                  <CubeCard
                    event={event}
                    onSelect={handleSelectCube}
                    isUserAffiliated={isAffiliated}
                  />
                  {/* Add divider between cards on mobile, but not after the last one */}
                  {index < eventsToDisplay.length - 1 && (
                    <div className="border-b border-gray-300 sm:hidden"></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full">
            <CubeMap
              events={eventsToDisplay}
              onSelectCube={handleSelectCube}
              chapters={chapters}
            />
          </div>
        )
      ) : (
        <div className="border border-black bg-white py-8 text-center dark:border-white dark:bg-black sm:py-12 md:py-16">
          <h3 className="text-base font-bold sm:text-lg md:text-xl">
            No {eventTimeView} events found for this region.
          </h3>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            Check back later or change your filter selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default CubeListPage;
