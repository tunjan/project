import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Chapter, Role, type User } from '@/types';

const CreateChapterForm: React.FC<{
  currentUser: User;
  chapters: Chapter[];
  onCreateChapter: (chapterData: Chapter) => void;
}> = ({ currentUser, chapters, onCreateChapter }) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState(
    currentUser.role === Role.REGIONAL_ORGANISER
      ? currentUser.managedCountry || ''
      : ''
  );
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [instagram, setInstagram] = useState('');

  const existingCountries = useMemo(
    () => [...new Set(chapters.map((c) => c.country))],
    [chapters]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newChapterData: Chapter = {
      name,
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      instagram: instagram || undefined,
    };
    onCreateChapter(newChapterData);

    setName('');
    if (currentUser.role !== Role.REGIONAL_ORGANISER) {
      setCountry('');
    }
    setLat('');
    setLng('');
    setInstagram('');
  };

  const isCountryLocked = currentUser.role === Role.REGIONAL_ORGANISER;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Chapter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-name">Chapter Name</Label>
            <Input
              id="chapter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              disabled={isCountryLocked}
              list="country-list"
            />
            {!isCountryLocked && (
              <datalist id="country-list">
                {existingCountries.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">
              Instagram Handle (e.g. @av.london)
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@av.london"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="any"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                step="any"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Chapter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChapterForm;
