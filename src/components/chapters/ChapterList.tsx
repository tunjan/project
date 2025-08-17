import React, { useState, useMemo } from 'react';
import { type Chapter } from '@/types';
import { getChapterStats, ChapterStats } from '@/utils/analytics';
import { useUsers, useEvents, useChapters } from '@/store/appStore';
import { SearchIcon } from '@/icons';

// A small helper component for stats on mobile
const Stat: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <p className="font-mono text-xl font-bold">{value}</p>
    <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
  </div>
);

const ChapterRow: React.FC<{
  chapterStats: ChapterStats;
  onSelect: () => void;
  isEven: boolean;
}> = ({ chapterStats, onSelect, isEven }) => {
  return (
    <button
      onClick={onSelect}
      className={`group w-full cursor-pointer border-t border-black p-4 text-left transition-all duration-150 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:grid md:grid-cols-6 md:items-center md:border-none ${
        isEven ? 'bg-white' : 'bg-neutral-50'
      }`}
    >
      {/* --- Mobile & Desktop: Chapter Name --- */}
      <div className="md:col-span-2">
        <p className="font-bold text-black group-hover:text-primary">
          {chapterStats.name}
        </p>
        <p className="text-sm text-neutral-500">{chapterStats.country}</p>
      </div>

      {/* --- Mobile View: Stats Grid --- */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-dashed border-neutral-300 pt-4 md:hidden">
        <Stat label="Members" value={chapterStats.memberCount} />
        <Stat label="Events" value={chapterStats.eventsHeld} />
        <Stat label="Hours" value={Math.round(chapterStats.totalHours)} />
        <Stat label="Convos" value={chapterStats.totalConversations} />
      </div>

      {/* --- Desktop View: Stats in Grid Columns --- */}
      <p className="hidden font-mono text-lg font-bold md:block">
        {chapterStats.memberCount}
      </p>
      <p className="hidden font-mono text-lg font-bold md:block">
        {chapterStats.eventsHeld}
      </p>
      <p className="hidden font-mono text-lg font-bold md:block">
        {Math.round(chapterStats.totalHours)}
      </p>
      <p className="hidden items-center justify-between font-mono text-lg font-bold md:flex">
        {chapterStats.totalConversations}
        <span className="text-2xl text-neutral-400 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-black">
          →
        </span>
      </p>
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

  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const chapterStats = useMemo(
    () => getChapterStats(allUsers, allEvents, allChapters),
    [allUsers, allEvents, allChapters]
  );

  const availableRegions = useMemo(() => {
    const regions = new Set(allChapters.map((c) => c.country));
    return ['all', ...Array.from(regions).sort()];
  }, [allChapters]);

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

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Global Chapters
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          An operational directory of our global network of activist chapters.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="card-brutal mb-8 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label
              htmlFor="search-filter"
              className="mb-1 block text-sm font-bold text-neutral-700"
            >
              Search by Name or Country
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="search-filter"
                type="text"
                placeholder="e.g. Berlin or USA"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-none border border-neutral-300 bg-white py-2 pl-10 pr-3 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="region-filter"
              className="mb-1 block text-sm font-bold text-neutral-700"
            >
              Filter by Region
            </label>
            <select
              id="region-filter"
              name="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
            >
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="card-brutal">
        {/* Desktop Header */}
        <div className="hidden grid-cols-6 items-center border-b border-black bg-neutral-50 p-4 text-xs font-bold uppercase tracking-wider text-neutral-500 md:grid">
          <p className="col-span-2">Chapter</p>
          <p>Members</p>
          <p>Events</p>
          <p>Hours</p>
          <p>Conversations</p>
        </div>
        {filteredAndSortedStats.length > 0 ? (
          <div>
            {filteredAndSortedStats.map((stat, index) => {
              const chapter = allChapters.find((c) => c.name === stat.name)!;
              return (
                <ChapterRow
                  key={stat.name}
                  chapterStats={stat}
                  onSelect={() => onNavigateToChapter(chapter)}
                  isEven={index % 2 === 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-black">No chapters found.</h3>
            <p className="mt-2 text-neutral-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;
