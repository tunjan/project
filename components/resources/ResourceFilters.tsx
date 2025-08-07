import React from 'react';
import { ResourceType, SkillLevel } from '../../types';
import { SearchIcon } from '../icons';

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

const SelectFilter: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}> = ({ value, onChange, children }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
    >
        {children}
    </select>
);


const ResourceFilters: React.FC<ResourceFiltersProps> = (props) => {
    return (
        <div className="bg-white border border-black p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by keyword..."
                            value={props.searchTerm}
                            onChange={e => props.setSearchTerm(e.target.value)}
                            className="block w-full border border-black bg-white py-2 pl-10 pr-3 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                        />
                    </div>
                </div>
                <div>
                     <SelectFilter value={props.selectedType} onChange={e => props.setSelectedType(e.target.value as ResourceType | 'all')}>
                        <option value="all">All Types</option>
                        {Object.values(ResourceType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </SelectFilter>
                </div>
                 <div>
                    <SelectFilter value={props.selectedLevel} onChange={e => props.setSelectedLevel(e.target.value as SkillLevel | 'all')}>
                        <option value="all">All Skill Levels</option>
                        {Object.values(SkillLevel).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </SelectFilter>
                </div>
                 <div>
                    <SelectFilter value={props.selectedLang} onChange={e => props.setSelectedLang(e.target.value)}>
                        {props.languages.map(lang => (
                             <option key={lang} value={lang}>{lang === 'all' ? 'All Languages' : lang}</option>
                        ))}
                    </SelectFilter>
                </div>
                <div >
                    <button 
                        onClick={() => {
                            props.setSearchTerm('');
                            props.setSelectedType('all');
                            props.setSelectedLevel('all');
                            props.setSelectedLang('all');
                        }}
                        className="w-full h-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceFilters;
