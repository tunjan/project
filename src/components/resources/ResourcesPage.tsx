import React, { useMemo, useState } from 'react';

import { BookOpenIcon } from '@/icons';
import { useResources } from '@/store';
import { type Resource, type ResourceType, type SkillLevel } from '@/types';

import ResourceCard from './ResourceCard';
import ResourceFilters from './ResourceFilters';

const ResourcesPage: React.FC = () => {
  const allResources = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | 'all'>('all');
  const [selectedLang, setSelectedLang] = useState('all');

  const languages = useMemo(
    () => ['all', ...new Set(allResources.map((r: Resource) => r.language))],
    [allResources]
  );

  const filteredResources = useMemo(() => {
    return allResources.filter((resource: Resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === 'all' || resource.type === selectedType;
      const matchesLevel =
        selectedLevel === 'all' || resource.skillLevel === selectedLevel;
      const matchesLang =
        selectedLang === 'all' || resource.language === selectedLang;
      return matchesSearch && matchesType && matchesLevel && matchesLang;
    });
  }, [allResources, searchTerm, selectedType, selectedLevel, selectedLang]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedLang('all');
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Learning Center
        </h1>
        <p className="text-grey-600 mt-3 max-w-2xl text-lg">
          Access protocol documents, training materials, and outreach guides.
        </p>
      </div>

      <ResourceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        languages={languages}
      />

      <div className="mt-8">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource: Resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="card-brutal card-padding text-center">
            <BookOpenIcon className="text-grey-500 mx-auto size-12" />
            <h3 className="mt-4 text-xl font-bold text-black">
              No resources found
            </h3>
            <p className="mt-2 text-neutral-500">
              Try adjusting your search or reset filters to see everything.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={resetFilters}
                className="btn-outline"
                aria-label="Reset filters"
                title="Reset filters"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
