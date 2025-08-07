import React, { useState, useMemo } from "react";
import { type User, Role, type Chapter } from "@/types";

interface CreateChapterFormProps {
  currentUser: User;
  chapters: Chapter[];
  onCreateChapter: (chapterData: Chapter) => void;
}

const InputField: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  step?: string;
  disabled?: boolean;
  list?: string;
}> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = true,
  step,
  disabled = false,
  list,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-black mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      step={step}
      disabled={disabled}
      list={list}
      className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm disabled:bg-neutral-200 disabled:text-neutral-500"
    />
  </div>
);

const CreateChapterForm: React.FC<CreateChapterFormProps> = ({
  currentUser,
  chapters,
  onCreateChapter,
}) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState(
    currentUser.role === Role.REGIONAL_ORGANISER
      ? currentUser.managedCountry || ""
      : ""
  );
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [instagram, setInstagram] = useState("");

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

    setName("");
    if (currentUser.role !== Role.REGIONAL_ORGANISER) {
      setCountry("");
    }
    setLat("");
    setLng("");
    setInstagram("");
  };

  const isCountryLocked = currentUser.role === Role.REGIONAL_ORGANISER;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-4 bg-white border border-black"
    >
      <InputField
        label="Chapter Name"
        id="chapter-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputField
        label="Country"
        id="country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
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
        className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
      >
        Create Chapter
      </button>
    </form>
  );
};

export default CreateChapterForm;
