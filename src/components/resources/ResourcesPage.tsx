import React, { useState, useMemo } from 'react';
import { type Resource, type ResourceType, type SkillLevel } from '@/types';
import ResourceCard from './ResourceCard';
import ResourceFilters from './ResourceFilters';
import { BookOpenIcon } from '@/icons';
import { useResources } from '@/store';

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

  return (
    <div className="py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Learning Center
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
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
          <div className="border-2 border-black bg-white p-8 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-xl font-bold text-black">
              No resources found.
            </h3>
            <p className="mt-2 text-neutral-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
