import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Stat } from '@/components/ui';
import { SearchIcon } from '@/icons';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { type Chapter, Role } from '@/types';
import { ChapterStats, getChapterStats } from '@/utils';

import ChapterCard from './ChapterCard';
import ChapterMap from './ChapterMap';
import RegionalOrganiserCard from './RegionalOrganiserCard';

const ChapterRow: React.FC<{
  chapterStats: ChapterStats;
  onSelect: () => void;
  isFirst?: boolean;
}> = ({ chapterStats, onSelect, isFirst = false }) => {
  return (
    <button
      className={`group w-full cursor-pointer bg-white p-4 text-left even:bg-neutral-100 hover:bg-primary-lightest hover:shadow-brutal dark:bg-black dark:even:bg-gray-800 dark:hover:bg-gray-700 md:grid md:grid-cols-6 md:items-center ${
        isFirst ? 'border-t-2 border-black dark:border-white md:border-t-0' : ''
      }`}
      onClick={onSelect}
      type="button"
      aria-label={`View details for ${chapterStats.name} chapter`}
    >
      {/* Chapter Name */}
      <div className="md:col-span-2">
        <Link
          to={`/chapters/${chapterStats.name}`}
          className="block font-bold text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group-hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {chapterStats.name}
        </Link>
        <p className="text-sm text-neutral-500 transition-colors duration-300 group-hover:text-black">
          {chapterStats.country}
        </p>
      </div>

      {/* Stats - Mobile: Grid layout, Desktop: Individual columns */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t-2 border-black pt-4 dark:border-white md:mt-0 md:grid-cols-4 md:border-t-0 md:pt-0">
        <Stat label="Members" value={chapterStats.memberCount} />
        <Stat label="Events" value={chapterStats.eventsHeld} />
        <Stat label="Hours" value={Math.round(chapterStats.totalHours)} />
        <Stat label="Convos" value={chapterStats.totalConversations} />
      </div>

      {/* Desktop arrow indicator */}
      <div className="hidden items-center justify-end md:flex">
        <span className="text-2xl text-neutral-500 group-hover:text-primary">
          →
        </span>
      </div>
    </button>
  );
};

interface ChapterListProps {
  onNavigateToChapter: (chapter: Chapter) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ onNavigateToChapter }) => {
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allChapters = useChapters();
  const allOutreachLogs = useOutreachLogs();

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'grid'>('grid');

  const chapterStats = useMemo(
    () => getChapterStats(allUsers, allEvents, allChapters, allOutreachLogs),
    [allUsers, allEvents, allChapters, allOutreachLogs]
  );

  const availableRegions = useMemo(() => {
    const regions = new Set(allChapters.map((c) => c.country));
    return ['all', ...Array.from(regions).sort()];
  }, [allChapters]);

  const regionalOrganiser = useMemo(() => {
    if (selectedRegion === 'all' || !selectedRegion) {
      return null;
    }
    return allUsers.find(
      (u) =>
        u.role === Role.REGIONAL_ORGANISER &&
        u.managedCountry === selectedRegion
    );
  }, [selectedRegion, allUsers]);

  const filteredAndSortedStats = useMemo(() => {
    return chapterStats
      .filter((stat) => {
        const regionMatch =
          selectedRegion === 'all' || stat.country === selectedRegion;
        const searchMatch =
          searchTerm === '' ||
          stat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.country.toLowerCase().includes(searchTerm.toLowerCase());
        return regionMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedRegion, searchTerm, chapterStats]);

  const filteredChapters = useMemo(() => {
    return allChapters.filter((chapter) => {
      const regionMatch =
        selectedRegion === 'all' || chapter.country === selectedRegion;
      const searchMatch =
        searchTerm === '' ||
        chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.country.toLowerCase().includes(searchTerm.toLowerCase());
      return regionMatch && searchMatch;
    });
  }, [selectedRegion, searchTerm, allChapters]);

  return (
    <div className="py-8 md:py-12">
      {/* Enhanced Header Section */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-2 bg-primary"></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {selectedRegion === 'all'
                ? 'Global Chapters'
                : `${selectedRegion} Chapters`}
            </h1>
          </div>
          <p className="max-w-3xl px-2 text-base leading-relaxed text-neutral-600 sm:px-0 sm:text-xl">
            An operational directory of our global network of activist chapters.
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label
              htmlFor="search-filter"
              className="mb-1 block text-sm font-bold text-black"
            >
              Search by Name or Country
            </label>
            <div className="relative border-2 border-black dark:border-white sm:border-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="size-5 text-neutral-500" />
              </div>
              <input
                id="search-filter"
                type="text"
                placeholder="Search by chapter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-nonenone block h-[42px] w-full border-black bg-white p-2 pl-10 pr-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-white dark:bg-black dark:text-white dark:placeholder:text-neutral-500 md:border-2"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="region-filter"
              className="mb-1 block text-sm font-bold text-black"
            >
              Filter by Region
            </label>
            <select
              id="region-filter"
              name="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block h-[42px] w-full border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-white dark:bg-black dark:text-white sm:text-sm md:border-2"
            >
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <div className="mb-1 block text-sm font-bold text-black">
              View Mode
            </div>
            <div className="flex border-black dark:border-white md:border-2">
              <button
                onClick={() => setViewMode('list')}
                className={`hidden flex-1 p-2 text-sm font-bold transition-colors md:block ${
                  viewMode === 'list'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 p-2 text-sm font-bold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 p-2 text-sm font-bold transition-colors ${
                  viewMode === 'map'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {regionalOrganiser && <RegionalOrganiserCard user={regionalOrganiser} />}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-8">
          <ChapterMap
            chapters={filteredChapters}
            onSelectChapter={onNavigateToChapter}
          />
        </div>
      )}

      {/* List and Grid Views */}
      {viewMode === 'list' && (
        <div className="border-black bg-white dark:border-white dark:bg-black lg:md:border-2">
          {/* Desktop Header */}
          <div className="hidden grid-cols-6 items-center border-b-2 border-black bg-white p-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-white dark:bg-black dark:text-gray-400 md:grid">
            <p className="col-span-2">Chapter</p>
            <p>Members</p>
            <p>Events</p>
            <p>Hours</p>
            <p>Conversations</p>
          </div>

          {/* CRITICAL FIX: Add semantic table structure for screen readers */}
          <table className="sr-only">
            <thead>
              <tr>
                <th scope="col">Chapter</th>
                <th scope="col">Country</th>
                <th scope="col">Members</th>
                <th scope="col">Events</th>
                <th scope="col">Hours</th>
                <th scope="col">Conversations</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStats.map((stat) => (
                <tr key={stat.name}>
                  <td>{stat.name}</td>
                  <td>{stat.country}</td>
                  <td>{stat.memberCount}</td>
                  <td>{stat.eventsHeld}</td>
                  <td>{Math.round(stat.totalHours)}</td>
                  <td>{stat.totalConversations}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedStats.length > 0 ? (
            <div className="divide-y-2 divide-black">
              {filteredAndSortedStats.map((stat, index) => {
                const chapter = allChapters.find((c) => c.name === stat.name)!;
                return (
                  <ChapterRow
                    key={stat.name}
                    chapterStats={stat}
                    onSelect={() => onNavigateToChapter(chapter)}
                    isFirst={index === 0}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-black">
                No chapters found.
              </h3>
              <p className="mt-2 text-neutral-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {filteredAndSortedStats.length > 0 ? (
            <div
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}
            >
              {filteredAndSortedStats.map((stat, index) => {
                const chapter = allChapters.find((c) => c.name === stat.name)!;
                return (
                  <div key={stat.name}>
                    <ChapterCard
                      chapterStats={stat}
                      onSelect={() => onNavigateToChapter(chapter)}
                    />
                    {/* Add divider between cards on mobile, but not after the last one */}
                    {index < filteredAndSortedStats.length - 1 && (
                      <div className="border-b border-gray-300 md:hidden"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-black bg-white p-8 text-center dark:border-white dark:bg-black md:border-2">
              <h3 className="text-xl font-bold text-black">
                No chapters found.
              </h3>
              <p className="mt-2 text-neutral-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChapterList;
