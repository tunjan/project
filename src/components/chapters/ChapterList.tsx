import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { type Chapter } from '@/types';
import { getChapterStats, ChapterStats } from '@/utils/analytics';
import { useUsers, useEvents, useChapters, useOutreachLogs } from '@/store';
import { SearchIcon } from '@/icons';
import ChapterMap from './ChapterMap';
import ChapterCard from './ChapterCard';

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
}> = ({ chapterStats, onSelect }) => {
  return (
    <div
      className="group w-full cursor-pointer bg-white p-4 text-left transition-all duration-300 even:bg-neutral-100 hover:bg-primary-lightest hover:shadow-brutal md:grid md:grid-cols-6 md:items-center"
      onClick={onSelect}
    >
      {/* --- Mobile & Desktop: Chapter Name --- */}
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

      {/* --- Mobile View: Stats Grid --- */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t-2 border-black pt-4 md:hidden">
        <Stat label="Members" value={chapterStats.memberCount} />
        <Stat label="Events" value={chapterStats.eventsHeld} />
        <Stat label="Hours" value={Math.round(chapterStats.totalHours)} />
        <Stat label="Convos" value={chapterStats.totalConversations} />
      </div>

      {/* --- Desktop View: Stats in Grid Columns --- */}
      <p className="hidden font-mono text-lg font-bold transition-colors duration-300 group-hover:text-primary md:block">
        {chapterStats.memberCount}
      </p>
      <p className="hidden font-mono text-lg font-bold transition-colors duration-300 group-hover:text-primary md:block">
        {chapterStats.eventsHeld}
      </p>
      <p className="hidden font-mono text-lg font-bold transition-colors duration-300 group-hover:text-primary md:block">
        {Math.round(chapterStats.totalHours)}
      </p>
      <p className="hidden items-center justify-between font-mono text-lg font-bold transition-colors duration-300 group-hover:text-primary md:flex">
        {chapterStats.totalConversations}
        <span className="text-2xl text-neutral-500 transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary">
          →
        </span>
      </p>
    </div>
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
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'grid'>('list');

  const chapterStats = useMemo(
    () => getChapterStats(allUsers, allEvents, allChapters, allOutreachLogs),
    [allUsers, allEvents, allChapters, allOutreachLogs]
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
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Global Chapters
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          An operational directory of our global network of activist chapters.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 border-2 border-black bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label
              htmlFor="search-filter"
              className="mb-1 block text-sm font-bold text-black"
            >
              Search by Name or Country
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                id="search-filter"
                type="text"
                placeholder="Search by chapter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-none border-2 border-black bg-white py-1.5 pl-10 pr-3 text-sm font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="block w-full border-2 border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
            >
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-bold text-black">
              View Mode
            </label>
            <div className="flex border-2 border-black">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 p-2 text-sm font-bold transition-colors ${
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

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-8 border-2 border-black bg-white">
          <ChapterMap
            chapters={filteredChapters}
            onSelectChapter={onNavigateToChapter}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="border-2 border-black bg-white">
          {/* Desktop Header */}
          <div className="hidden grid-cols-6 items-center border-b-2 border-black bg-white p-4 text-xs font-bold uppercase tracking-wider text-neutral-500 md:grid">
            <p className="col-span-2">Chapter</p>
            <p>Members</p>
            <p>Events</p>
            <p>Hours</p>
            <p>Conversations</p>
          </div>
          {filteredAndSortedStats.length > 0 ? (
            <div className="divide-y-2 divide-black">
              {filteredAndSortedStats.map((stat) => {
                const chapter = allChapters.find((c) => c.name === stat.name)!;
                return (
                  <ChapterRow
                    key={stat.name}
                    chapterStats={stat}
                    onSelect={() => onNavigateToChapter(chapter)}
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedStats.map((stat) => {
                const chapter = allChapters.find((c) => c.name === stat.name)!;
                return (
                  <ChapterCard
                    key={stat.name}
                    chapterStats={stat}
                    onSelect={() => onNavigateToChapter(chapter)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-black bg-white p-8 text-center">
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
