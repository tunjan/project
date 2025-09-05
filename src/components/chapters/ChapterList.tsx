import { ChevronRight, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${
        isFirst ? 'border-t-2 border-t-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="md:grid md:grid-cols-6 md:items-center">
          {/* Chapter Name */}
          <div className="md:col-span-1">
            <Link
              to={`/chapters/${chapterStats.name}`}
              className="block font-semibold text-foreground transition-colors duration-300 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {chapterStats.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {chapterStats.country}
            </p>
          </div>

          {/* Stats - Mobile: Grid layout, Desktop: Individual columns */}
          <div className="mt-4 grid grid-cols-2 gap-4 md:col-span-4 md:mt-0 md:grid-cols-4">
            <div className="text-center">
              <p className="font-mono text-xl font-bold">
                {chapterStats.memberCount}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Members
              </p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold">
                {chapterStats.eventsHeld}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Events
              </p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold">
                {Math.round(chapterStats.totalHours)}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Hours
              </p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-bold">
                {chapterStats.totalConversations}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Convos
              </p>
            </div>
          </div>

          {/* Desktop arrow indicator */}
          <div className="hidden items-center justify-end md:flex">
            <ChevronRight className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {selectedRegion === 'all'
                  ? 'Global Chapters'
                  : `${selectedRegion} Chapters`}
              </h1>
              <p className="mt-2 text-muted-foreground">
                An operational directory of our global network of activist
                chapters.
              </p>
            </div>
          </div>
          <Separator />
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label
                    htmlFor="search-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Search by Name or Country
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search-filter"
                      type="text"
                      placeholder="Search by chapter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="region-filter">Filter by Region</Label>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region === 'all' ? 'All Regions' : region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label>View Mode</Label>
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value: string) => {
                      if (value) setViewMode(value as 'list' | 'map' | 'grid');
                    }}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="list"
                      className="flex-1"
                      aria-label="List view"
                    >
                      List
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="grid"
                      className="flex-1"
                      aria-label="Grid view"
                    >
                      Grid
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="map"
                      className="flex-1"
                      aria-label="Map view"
                    >
                      Map
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {regionalOrganiser && (
          <RegionalOrganiserCard user={regionalOrganiser} />
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <ChapterMap
                  chapters={filteredChapters}
                  onSelectChapter={onNavigateToChapter}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* List and Grid Views */}
        {viewMode === 'list' && (
          <div className="mb-8">
            {filteredAndSortedStats.length > 0 ? (
              <div className="space-y-4">
                {filteredAndSortedStats.map((stat, index) => {
                  const chapter = allChapters.find(
                    (c) => c.name === stat.name
                  )!;
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
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    No chapters found.
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="mb-8">
            {filteredAndSortedStats.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedStats.map((stat) => {
                  const chapter = allChapters.find(
                    (c) => c.name === stat.name
                  )!;
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
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    No chapters found.
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;
