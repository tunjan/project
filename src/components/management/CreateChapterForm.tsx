import React, { useMemo, useState } from 'react';

import { InputField } from '@/components/ui/Form';
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-2 border-black bg-white p-6"
    >
      <InputField
        label="Chapter Name"
        id="chapter-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <label
          htmlFor="country"
          className="mb-1 block text-sm font-bold text-black"
        >
          Country
        </label>
        <input
          type="text"
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          disabled={isCountryLocked}
          list="country-list"
          className="rounded-nonenone block w-full border border-black bg-white p-2 text-black placeholder:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm"
        />
      </div>
      {!isCountryLocked && (
        <datalist id="country-list">
          {existingCountries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}
      <InputField
        label="Instagram Handle (e.g. @av.london)"
        id="instagram"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        required={false}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Latitude"
          id="lat"
          type="number"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          step="any"
        />
        <InputField
          label="Longitude"
          id="lng"
          type="number"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          step="any"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
      >
        Create Chapter
      </button>
    </form>
  );
};

export default CreateChapterForm;
