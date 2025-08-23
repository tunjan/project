import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasOrganizerRole } from '@/utils/auth';
import { useEvents, useChapters } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import CubeCard from '@/components/CubeCard';
import CubeMap from '@/components/CubeMap';
import CubeCalendar from '@/components/CubeCalendar';
import {
  PlusIcon,
  ListBulletIcon,
  MapIcon,
  SearchIcon,
  CalendarIcon,
} from '@/icons';
import { type CubeEvent, type Chapter } from '@/types';

type CubesView = 'list' | 'map' | 'calendar';
type EventTimeView = 'upcoming' | 'past';

const ViewToggleButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 border px-3 py-1.5 text-sm font-semibold ${
      isActive
        ? 'border-black bg-black text-white'
        : 'border-black bg-white text-black hover:bg-neutral-100'
    } transition-colors duration-200`}
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
        const isEventInPast = e.startDate < now;
        const timeMatch =
          eventTimeView === 'past' ? isEventInPast : !isEventInPast;

        const chapterOfEvent = chapters.find((c: Chapter) => c.name === e.city);
        const regionMatch =
          selectedRegion === 'all' ||
          chapterOfEvent?.country === selectedRegion;

        const searchMatch =
          searchTerm === '' ||
          e.city.toLowerCase().includes(searchTerm.toLowerCase());

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
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="relative mb-2 flex w-full flex-col items-center justify-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
            {eventTimeView === 'upcoming' ? 'Upcoming Cubes' : 'Past Cubes'}
          </h1>
          {currentUser && hasOrganizerRole(currentUser) && (
            <button
              onClick={handleCreateCube}
              className="m-3 flex items-center bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover lg:absolute lg:right-0 lg:m-0"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create Cube
            </button>
          )}
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-neutral-600">
          {eventTimeView === 'upcoming'
            ? 'Find an event near you and join the movement.'
            : 'A history of our actions. Organizers can select an event to log reports.'}
        </p>
      </div>

      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto">
          {}
          <div className="flex items-center border border-black">
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
        {}
        <div className="relative w-full md:w-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-neutral-600" />
          </div>
          <input
            type="text"
            placeholder="Search by chapter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-none border-2 border-black bg-white py-1.5 pl-10 pr-3 text-sm font-semibold text-black placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {}
        <div className="flex items-center space-x-0 border border-black">
          <ViewToggleButton
            onClick={() => setCubesView('list')}
            isActive={cubesView === 'list'}
          >
            <ListBulletIcon className="h-5 w-5" />
            <span>List</span>
          </ViewToggleButton>
          <ViewToggleButton
            onClick={() => setCubesView('map')}
            isActive={cubesView === 'map'}
          >
            <MapIcon className="h-5 w-5" />
            <span>Map</span>
          </ViewToggleButton>
          <ViewToggleButton
            onClick={() => setCubesView('calendar')}
            isActive={cubesView === 'calendar'}
          >
            <CalendarIcon className="h-5 w-5" />
            <span>Calendar</span>
          </ViewToggleButton>
        </div>
      </div>

      {eventsToDisplay.length > 0 ? (
        cubesView === 'list' ? (
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
            {eventsToDisplay.map((event) => {
              const isAffiliated =
                !!currentUser &&
                (currentUser.chapters.includes(event.city) ||
                  currentUser.organiserOf?.includes(event.city));
              return (
                <CubeCard
                  key={event.id}
                  event={event}
                  onSelect={handleSelectCube}
                  isUserAffiliated={isAffiliated}
                />
              );
            })}
          </div>
        ) : cubesView === 'map' ? (
          <CubeMap
            events={eventsToDisplay}
            onSelectCube={handleSelectCube}
            chapters={chapters}
          />
        ) : (
          <CubeCalendar
            events={eventsToDisplay}
            onSelectEvent={handleSelectCube}
          />
        )
      ) : (
        <div className="border border-black bg-white py-16 text-center">
          <h3 className="text-xl font-bold">
            No {eventTimeView} events found for this region.
          </h3>
          <p className="mt-2 text-neutral-500">
            Check back later or change your filter selection.
          </p>
        </div>
      )}
    </div>
  );
};

export default CubeListPage;
