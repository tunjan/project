import React, { useState, useMemo, useEffect } from 'react';
import { Role, Chapter } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useChapters } from '@/store/appStore';
import { toast } from 'sonner';
import { InputField, SelectField } from '@/components/ui/Form';

type EventType = 'Chapter' | 'Special';

interface CreateEventFormProps {
  onCreateEvent: (eventData: {
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
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
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
    const finalStartDate = new Date(`${startDate}T${startTime}`);
    let finalEndDate: Date | undefined;
    if (eventType === 'Special' && endDate && endTime) {
      finalEndDate = new Date(`${endDate}T${endTime}`);
      if (finalEndDate <= finalStartDate) {
        toast.error('End date must be after the start date.');
        return;
      }
    }

    onCreateEvent({
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
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl border border-black bg-white">
        <div className="border-b border-black p-8">
          <h1 className="text-3xl font-extrabold text-black">
            Create New Event
          </h1>
          <p className="mt-2 text-neutral-600">
            Schedule a standard chapter cube or organize a special multi-day
            regional event.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <SelectField
            label="Event Type"
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
          >
            <option value="Chapter">Standard Chapter Cube</option>
            <option value="Special">Special Event</option>
          </SelectField>

          {eventType === 'Special' && (
            <SelectField
              label="Scope"
              id="scope"
              value={scope}
              onChange={(e) =>
                setScope(e.target.value as 'Regional' | 'Global')
              }
            >
              <option value="Regional">Regional Event</option>
              {}
            </SelectField>
          )}

          {eventType === 'Special' && scope === 'Regional' && (
            <SelectField
              label="Target Region"
              id="target-region"
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a region
              </option>
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </SelectField>
          )}

          <SelectField
            label="Host City"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={organizableChapters.length === 0}
          >
            <option value="" disabled>
              Select a host city
            </option>
            {organizableChapters.map((chapterName) => (
              <option key={chapterName} value={chapterName}>
                {chapterName}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Exact Location"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="Start Date"
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <InputField
              label="Start Time"
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          {eventType === 'Special' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                label="End Date (Optional)"
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required={false}
              />
              <InputField
                label="End Time (Optional)"
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required={false}
              />
            </div>
          )}

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-black px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;
