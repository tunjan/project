import { BookOpen } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Learning Center
              </h1>
              <p className="mt-2 text-muted-foreground">
                Access protocol documents, training materials, and outreach
                guides to enhance your activism skills.
              </p>
            </div>
          </div>
          <Separator />
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
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  No resources found
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or reset filters to see everything.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    onClick={resetFilters}
                    variant="outline"
                    aria-label="Reset filters"
                    title="Reset filters"
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
