import React, { useState, useMemo } from 'react';
import { type Chapter } from '@/types';
import { getChapterStats, ChapterStats } from '@/utils/analytics';
import { useUsers, useEvents, useChapters } from '@/store/appStore';
import { SearchIcon } from '@/icons';

const ChapterRow: React.FC<{
  chapterStats: ChapterStats;
  onSelect: () => void;
}> = ({ chapterStats, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="group grid w-full cursor-pointer grid-cols-6 items-center border-t border-black p-4 text-left transition-colors duration-200 hover:bg-neutral-100"
    >
      <div className="col-span-2">
        <p className="font-bold text-black group-hover:text-primary">
          {chapterStats.name}
        </p>
        <p className="text-sm text-neutral-500">{chapterStats.country}</p>
      </div>
      <p className="font-mono text-lg font-bold">{chapterStats.memberCount}</p>
      <p className="font-mono text-lg font-bold">{chapterStats.eventsHeld}</p>
      <p className="font-mono text-lg font-bold">
        {Math.round(chapterStats.totalHours)}
      </p>
      <p className="flex items-center justify-between font-mono text-lg font-bold">
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

      {}
      <div className="mb-8 border border-black bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label
              htmlFor="search-filter"
              className="mb-1 block text-sm font-bold"
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
                className="block w-full rounded-none border border-black bg-white py-2 pl-10 pr-3 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="region-filter"
              className="mb-1 block text-sm font-bold"
            >
              Filter by Region
            </label>
            <select
              id="region-filter"
              name="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="block w-full rounded-none border border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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

      {}
      <div className="border-x border-b border-black bg-white">
        {}
        <div className="grid-cols-6 items-center border-b border-t border-black bg-neutral-50 p-4 text-xs font-bold uppercase tracking-wider text-neutral-500 md:grid">
          <p className="col-span-2">Chapter</p>
          <p>Members</p>
          <p>Events</p>
          <p>Hours</p>
          <p>Conversations</p>
        </div>
        {filteredAndSortedStats.length > 0 ? (
          <div>
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
