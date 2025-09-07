import { List, Map, Plus, Search } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import CubeCard from '@/components/CubeCard';
import CubeMap from '@/components/CubeMap';
import CreateEventForm from '@/components/events/CreateEventForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { can, Permission } from '@/config';
import { useChapters, useEvents, useEventsActions } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { type Chapter, type CubeEvent } from '@/types';

type CubesView = 'list' | 'map';
type EventTimeView = 'upcoming' | 'past';

const CubeListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const allEvents = useEvents();
  const chapters = useChapters();
  const { createEvent } = useEventsActions();

  const [cubesView, setCubesView] = useState<CubesView>('list');
  const [eventTimeView, setEventTimeView] = useState<EventTimeView>('upcoming');
  const [selectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

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
    setIsCreateEventModalOpen(true);
  }, []);

  const handleCreateEvent = useCallback(
    (eventData: {
      name: string;
      city: string;
      location: string;
      startDate: Date;
      endDate?: Date;
      scope: 'Chapter' | 'Regional' | 'Global';
      targetRegion?: string;
    }) => {
      if (!currentUser) {
        toast.error('You must be logged in to create an event.');
        return;
      }
      createEvent(eventData, currentUser);
      toast.success('Event created successfully!');
      setIsCreateEventModalOpen(false);
    },
    [currentUser, createEvent]
  );

  const handleCancelCreateEvent = useCallback(() => {
    setIsCreateEventModalOpen(false);
  }, []);

  const totalParticipants = eventsToDisplay.reduce(
    (sum, event) => sum + event.participants.length,
    0
  );
  const uniqueCities = new Set(eventsToDisplay.map((e) => e.city)).size;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {eventTimeView === 'upcoming' ? 'Upcoming Cubes' : 'Past Cubes'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Discover and join impactful cube events in your area.
              </p>
            </div>
            {currentUser && can(currentUser, Permission.CREATE_EVENT) && (
              <Button
                onClick={handleCreateCube}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                Create Cube
              </Button>
            )}
          </div>
          <Separator />
        </div>

        {/* Metrics Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {eventsToDisplay.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {eventTimeView === 'upcoming' ? 'Upcoming' : 'Past'} Events
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {totalParticipants}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total Participants
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {uniqueCities}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Cities</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
                {/* Time View Toggle */}
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-foreground">
                    Time Period
                  </div>
                  <Tabs
                    value={eventTimeView}
                    onValueChange={(value) =>
                      setEventTimeView(value as EventTimeView)
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Search Input */}
                <div className="flex flex-col gap-2 md:col-span-1">
                  <div className="text-sm font-medium text-foreground">
                    Search
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by chapter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-foreground">
                    View Mode
                  </div>
                  <Tabs
                    value={cubesView}
                    onValueChange={(value) => setCubesView(value as CubesView)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">
                        <List className="mr-2 size-4" />
                        List
                      </TabsTrigger>
                      <TabsTrigger value="map">
                        <Map className="mr-2 size-4" />
                        Map
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        {eventsToDisplay.length > 0 ? (
          cubesView === 'list' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {eventsToDisplay.map((event) => {
                const isAffiliated =
                  !!currentUser &&
                  (currentUser.chapters?.includes(event.city) ||
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
          ) : (
            <Card>
              <CardContent className="p-6">
                <CubeMap
                  events={eventsToDisplay}
                  onSelectCube={handleSelectCube}
                  chapters={chapters}
                />
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground">
                No {eventTimeView} events found.
              </h3>
              <p className="mt-2 text-muted-foreground">
                Check back later or change your filter selection.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Event Modal */}
      <Dialog
        open={isCreateEventModalOpen}
        onOpenChange={setIsCreateEventModalOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Schedule a standard chapter cube or organize a special multi-day
              regional event.
            </DialogDescription>
          </DialogHeader>
          <CreateEventForm
            onCreateEvent={handleCreateEvent}
            onCancel={handleCancelCreateEvent}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CubeListPage;
