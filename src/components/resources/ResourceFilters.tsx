import React from 'react';

import { SelectField } from '@/components/ui';
import { SearchIcon } from '@/icons';
import { ResourceType, SkillLevel } from '@/types';

interface ResourceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: ResourceType | 'all';
  setSelectedType: (value: ResourceType | 'all') => void;
  selectedLevel: SkillLevel | 'all';
  setSelectedLevel: (value: SkillLevel | 'all') => void;
  selectedLang: string;
  setSelectedLang: (value: string) => void;
  languages: string[];
}

const ResourceFilters: React.FC<ResourceFiltersProps> = (props) => {
  return (
    <div className="border-black bg-white p-4 md:border-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-4">
          <label htmlFor="keyword-search" className="sr-only">
            Search by keyword
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="size-5 text-neutral-500" />
            </div>
            <input
              type="text"
              id="keyword-search"
              placeholder="Search by keyword..."
              value={props.searchTerm}
              onChange={(e) => props.setSearchTerm(e.target.value)}
              className="rounded-nonenone block w-full border border-black bg-white py-2 pl-10 pr-3 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <SelectField
            label="Type"
            id="type-filter"
            value={props.selectedType}
            onChange={(e) =>
              props.setSelectedType(e.target.value as ResourceType | 'all')
            }
          >
            <option value="all">All Types</option>
            {Object.values(ResourceType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <SelectField
            label="Skill Level"
            id="level-filter"
            value={props.selectedLevel}
            onChange={(e) =>
              props.setSelectedLevel(e.target.value as SkillLevel | 'all')
            }
          >
            <option value="all">All Skill Levels</option>
            {Object.values(SkillLevel).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>
        </div>
        <div>
          <SelectField
            label="Language"
            id="lang-filter"
            value={props.selectedLang}
            onChange={(e) => props.setSelectedLang(e.target.value)}
          >
            {props.languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="self-end">
          <button
            onClick={() => {
              props.setSearchTerm('');
              props.setSelectedType('all');
              props.setSelectedLevel('all');
              props.setSelectedLang('all');
            }}
            className="size-full border-black bg-black px-4 py-2 font-bold text-white transition-colors duration-300 hover:bg-black md:border-2"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
export default ResourceFilters;
