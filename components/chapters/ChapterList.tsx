import React from 'react';
import { type Chapter } from '../../types';
import { getChapterStats } from '../../utils/analytics';
import ChapterCard from './ChapterCard';
import { BuildingOfficeIcon } from '../icons';
import { useData } from '../../contexts/DataContext';

interface ChapterListProps {
    onNavigateToChapter: (chapter: Chapter) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ onNavigateToChapter }) => {
    const { users: allUsers, events: allEvents, chapters: allChapters, outreachLogs: allOutreachLogs } = useData();
    
    const chapterStats = getChapterStats(allUsers, allEvents, allChapters, allOutreachLogs);
    const sortedStats = chapterStats.sort((a,b) => a.name.localeCompare(b.name));

    return (
        <div className="py-8 md:py-12">
            <div className="mb-8 md:mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">Chapters</h1>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-neutral-600">
                    Explore our global network of activist chapters.
                </p>
            </div>

            {sortedStats.length > 0 ? (
                <div className="grid gap-6 md:gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {sortedStats.map(stat => {
                        const chapter = allChapters.find(c => c.name === stat.name)!;
                        return (
                            <ChapterCard 
                                key={stat.name} 
                                chapterStats={stat} 
                                onSelect={() => onNavigateToChapter(chapter)} 
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="border border-black p-8 text-center bg-white">
                    <BuildingOfficeIcon className="w-12 h-12 mx-auto text-neutral-300"/>
                    <h3 className="text-xl font-bold text-black mt-4">No chapters found.</h3>
                    <p className="mt-2 text-neutral-500">This is unexpected. Please contact an administrator.</p>
                </div>
            )}
        </div>
    );
};

export default ChapterList;
