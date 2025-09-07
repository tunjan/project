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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Chapter, Role } from '@/types';
import { getChapterStats } from '@/utils';

import ChapterCard from './ChapterCard';
import ChapterMap from './ChapterMap';
import RegionalOrganiserCard from './RegionalOrganiserCard';

interface ChapterListProps {
  onNavigateToChapter: (chapter: Chapter) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ onNavigateToChapter }) => {
  const allUsers = useUsers();
  const allEvents = useEvents();
  const allChapters = useChapters();
  const allOutreachLogs = useOutreachLogs();
  const currentUser = useCurrentUser();

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
      <div className="container mx-auto max-w-7xl px-4">
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
                  <Tabs
                    value={viewMode}
                    onValueChange={(value: string) => {
                      if (value) setViewMode(value as 'list' | 'map' | 'grid');
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="list">List</TabsTrigger>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                      <TabsTrigger value="map">Map</TabsTrigger>
                    </TabsList>
                  </Tabs>
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
            <Card>
              <CardContent className="p-0">
                {filteredAndSortedStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 hover:bg-transparent">
                        <TableHead className="w-[300px] py-4 pl-6 font-semibold text-foreground">
                          Chapter
                        </TableHead>
                        <TableHead className="py-4 text-center font-semibold text-foreground">
                          Members
                        </TableHead>
                        <TableHead className="py-4 text-center font-semibold text-foreground">
                          Events
                        </TableHead>
                        <TableHead className="py-4 text-center font-semibold text-foreground">
                          Hours
                        </TableHead>
                        <TableHead className="py-4 text-center font-semibold text-foreground">
                          Conversations
                        </TableHead>
                        <TableHead className="w-[60px] pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedStats.map((stat) => {
                        const chapter = allChapters.find(
                          (c) => c.name === stat.name
                        )!;
                        const isUserChapter =
                          currentUser?.chapters?.includes(stat.name) || false;
                        return (
                          <TableRow
                            key={stat.name}
                            className={`group cursor-pointer transition-all duration-200 hover:bg-accent/30 ${
                              isUserChapter
                                ? 'border-l-4 border-l-primary bg-primary/5'
                                : ''
                            }`}
                            onClick={() => onNavigateToChapter(chapter)}
                          >
                            <TableCell className="py-6 pl-6">
                              <div>
                                <Link
                                  to={`/chapters/${stat.name}`}
                                  className="text-base font-semibold text-foreground transition-colors duration-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {stat.name}
                                </Link>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {stat.country}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-xl font-bold text-foreground">
                                  {stat.memberCount}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Members
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-xl font-bold text-foreground">
                                  {stat.eventsHeld}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Events
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-xl font-bold text-foreground">
                                  {Math.round(stat.totalHours).toLocaleString()}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Hours
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-xl font-bold text-foreground">
                                  {stat.totalConversations.toLocaleString()}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Conversations
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="flex justify-center">
                                <div className="rounded-full p-2 transition-colors group-hover:bg-primary/10">
                                  <ChevronRight className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                      <Search className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      No chapters found
                    </h3>
                    <p className="mx-auto max-w-sm text-muted-foreground">
                      Try adjusting your search terms or filters to find the
                      chapters you're looking for.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  const isUserChapter =
                    currentUser?.chapters?.includes(stat.name) || false;
                  return (
                    <ChapterCard
                      key={stat.name}
                      chapterStats={stat}
                      onSelect={() => onNavigateToChapter(chapter)}
                      isUserChapter={isUserChapter}
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
