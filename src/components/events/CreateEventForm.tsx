import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChapters } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { Chapter, Role } from '@/types';

type EventType = 'Chapter' | 'Special';

interface CreateEventFormProps {
  onCreateEvent: (eventData: {
    name: string;
    city: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    scope: 'Chapter' | 'Regional' | 'Global';
    targetRegion?: string;
  }) => void;
  onCancel: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onCreateEvent,
  onCancel,
}) => {
  const currentUser = useCurrentUser();
  const allChapters = useChapters();

  const [eventType, setEventType] = useState<EventType>('Chapter');
  const [scope, setScope] = useState<'Regional' | 'Global'>('Regional');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState('');
  const [targetRegion, setTargetRegion] = useState('');

  const { availableRegions } = useMemo(() => {
    if (!currentUser) return { availableRegions: [] };
    let chapters: Chapter[] = [];
    switch (currentUser.role) {
      case Role.GODMODE:
      case Role.GLOBAL_ADMIN:
        chapters = allChapters;
        break;
      case Role.REGIONAL_ORGANISER:
        chapters = allChapters.filter(
          (c) => c.country === currentUser.managedCountry
        );
        break;
      case Role.CHAPTER_ORGANISER:
        chapters = allChapters.filter((c) =>
          currentUser.organiserOf?.includes(c.name)
        );
        break;
    }
    return {
      availableRegions: [...new Set(chapters.map((c) => c.country))].sort(),
    };
  }, [currentUser, allChapters]);

  const organizableChapters = useMemo(() => {
    if (!currentUser) return [];

    let chapters: Chapter[] = [];

    switch (currentUser.role) {
      case Role.GODMODE:
      case Role.GLOBAL_ADMIN:
        chapters = allChapters;
        break;
      case Role.REGIONAL_ORGANISER:
        chapters = allChapters.filter(
          (c) => c.country === currentUser.managedCountry
        );
        break;
      case Role.CHAPTER_ORGANISER:
        chapters = allChapters.filter((c) =>
          currentUser.organiserOf?.includes(c.name)
        );
        break;
    }

    if (eventType === 'Special' && scope === 'Regional' && targetRegion) {
      return chapters
        .filter((c) => c.country === targetRegion)
        .map((c) => c.name)
        .sort();
    }

    if (eventType === 'Chapter') {
      return chapters.map((c) => c.name).sort();
    }

    return [];
  }, [currentUser, allChapters, eventType, scope, targetRegion]);

  useEffect(() => {
    setCity('');
  }, [eventType, scope, targetRegion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !startTime) {
      toast.error('Please select a valid start date and time.');
      return;
    }

    const finalStartDate = new Date(startDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    finalStartDate.setHours(hours, minutes, 0, 0);

    let finalEndDate: Date | undefined;
    if (eventType === 'Special' && endDate && endTime) {
      finalEndDate = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      finalEndDate.setHours(endHours, endMinutes, 0, 0);

      if (finalEndDate <= finalStartDate) {
        toast.error('End date must be after the start date.');
        return;
      }
    }

    onCreateEvent({
      name,
      city,
      location,
      startDate: finalStartDate,
      endDate: finalEndDate,
      scope: eventType === 'Chapter' ? 'Chapter' : scope,
      targetRegion:
        eventType === 'Special' && scope === 'Regional'
          ? targetRegion
          : undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Cube of Truth"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select
                value={eventType}
                onValueChange={(value) => setEventType(value as EventType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chapter">Standard Chapter Cube</SelectItem>
                  <SelectItem value="Special">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {eventType === 'Special' && (
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={scope}
                  onValueChange={(value) =>
                    setScope(value as 'Regional' | 'Global')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regional">Regional Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {eventType === 'Special' && scope === 'Regional' && (
              <div className="space-y-2">
                <Label htmlFor="target-region">Target Region</Label>
                <Select value={targetRegion} onValueChange={setTargetRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="city">Host City</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a host city" />
                </SelectTrigger>
                <SelectContent>
                  {organizableChapters.map((chapterName) => (
                    <SelectItem key={chapterName} value={chapterName}>
                      {chapterName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Exact Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Central Square"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            {eventType === 'Special' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="Select end date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time (Optional)</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create Event
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEventForm;
