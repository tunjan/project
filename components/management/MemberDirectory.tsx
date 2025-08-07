import React, { useState } from 'react';
import { type User, type Chapter } from '../../types';
import { SearchIcon, ChevronRightIcon } from '../icons';

interface MemberDirectoryProps {
  members: User[];
  onSelectUser: (user: User) => void;
  filterableChapters: Chapter[];
}

const MemberRow: React.FC<{ user: User, onSelectUser: (user: User) => void }> = ({ user, onSelectUser }) => {
    const chapterText = user.chapters.length > 0 ? `${user.chapters.join(', ')} Chapter(s)` : 'No chapter';
    
    return (
        <button 
            onClick={() => onSelectUser(user)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-100 transition-colors duration-200 group"
        >
            <div className="flex items-center space-x-4">
                <img src={user.profilePictureUrl} alt={user.name} className="w-10 h-10 object-cover"/>
                <div>
                    <p className="font-bold text-black group-hover:text-[#d81313] transition-colors">{user.name}</p>
                    <p className="text-sm text-neutral-500">{chapterText}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                {user.onboardingStatus === 'Awaiting Verification' && (
                  <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-1 hidden sm:block">AWAITING VERIFICATION</span>
                )}
                <span className="text-sm text-black font-semibold hidden md:block">{user.role}</span>
                <ChevronRightIcon className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
            </div>
        </button>
    );
};

const MemberDirectory: React.FC<MemberDirectoryProps> = ({ members, onSelectUser, filterableChapters }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('all');

    const filteredMembers = members
        .filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(member => {
            if (selectedChapter === 'all') return true;
            return member.chapters.includes(selectedChapter);
        });

    return (
        <div className="bg-white border border-black">
            <div className="p-4 border-b border-black">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative w-full md:flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search members by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full border border-black bg-white py-2 pl-10 pr-3 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                        />
                    </div>
                    {filterableChapters.length > 0 && (
                       <div className="w-full md:w-auto md:flex-shrink-0 md:min-w-[200px]">
                            <select
                                id="chapter-filter"
                                value={selectedChapter}
                                onChange={e => setSelectedChapter(e.target.value)}
                                className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
                                aria-label="Filter by chapter"
                            >
                                <option value="all">All Chapters</option>
                                {filterableChapters.map(chapter => (
                                    <option key={chapter.name} value={chapter.name}>{chapter.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
            {filteredMembers.length > 0 ? (
                 <div className="divide-y divide-black">
                    {filteredMembers.map(user => (
                        <MemberRow key={user.id} user={user} onSelectUser={onSelectUser} />
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-neutral-500">No members found for the current selection.</p>
                </div>
            )}
           
        </div>
    );
};

export default MemberDirectory;