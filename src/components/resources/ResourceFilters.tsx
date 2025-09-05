import { Search } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-4">
            <Label htmlFor="keyword-search" className="sr-only">
              Search by keyword
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                id="keyword-search"
                placeholder="Search by keyword..."
                value={props.searchTerm}
                onChange={(e) => props.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type-filter">Type</Label>
            <Select
              value={props.selectedType}
              onValueChange={(value: string) =>
                props.setSelectedType(value as ResourceType | 'all')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(ResourceType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level-filter">Skill Level</Label>
            <Select
              value={props.selectedLevel}
              onValueChange={(value: string) =>
                props.setSelectedLevel(value as SkillLevel | 'all')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skill Levels</SelectItem>
                {Object.values(SkillLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lang-filter">Language</Label>
            <Select
              value={props.selectedLang}
              onValueChange={(value: string) => props.setSelectedLang(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {props.languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="self-end">
            <Button
              variant="outline"
              onClick={() => {
                props.setSearchTerm('');
                props.setSelectedType('all');
                props.setSelectedLevel('all');
                props.setSelectedLang('all');
              }}
              className="w-full"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ResourceFilters;
