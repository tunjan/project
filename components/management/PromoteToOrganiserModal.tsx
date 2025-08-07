import React, { useState, useMemo } from 'react';
import { type User, type Chapter, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface PromoteToOrganiserModalProps {
    userToManage: User;
    onClose: () => void;
    onConfirm: (chapters: string[]) => void;
}

const PromoteToOrganiserModal: React.FC<PromoteToOrganiserModalProps> = ({ userToManage, onClose, onConfirm }) => {
    const { currentUser } = useAuth();
    const { chapters } = useData();
    
    const isEditing = userToManage.role === Role.CHAPTER_ORGANISER;
    
    const [selectedChapters, setSelectedChapters] = useState<string[]>(
        isEditing ? userToManage.organiserOf || [] : []
    );
    
    const promotableChapters = useMemo(() => {
        if (!currentUser) return [];

        if (currentUser.role === Role.REGIONAL_ORGANISER && currentUser.managedCountry) {
            // A Regional Organiser can only promote a user to organise chapters within their managed country
            // AND that the user is already a member of.
            const countryChapters = chapters.filter(c => c.country === currentUser.managedCountry);
            return countryChapters.filter(c => userToManage.chapters.includes(c.name));
        }
        if (currentUser.role === Role.GLOBAL_ADMIN || currentUser.role === Role.GODMODE) {
            // Admins can promote a user to organise any chapter they are a member of.
            return chapters.filter(c => userToManage.chapters.includes(c.name));
        }
        return [];
    }, [currentUser, userToManage, chapters]);

    const handleCheckboxChange = (chapterName: string) => {
        setSelectedChapters(prev => 
            prev.includes(chapterName)
                ? prev.filter(c => c !== chapterName)
                : [...prev, chapterName]
        );
    };

    const handleSubmit = () => {
        if (selectedChapters.length === 0) {
            alert('An organiser must be assigned to at least one chapter.');
            return;
        }
        onConfirm(selectedChapters);
    };

    const modalTitle = isEditing ? 'Edit Organised Chapters' : 'Promote to Chapter Organiser';
    const buttonText = isEditing ? 'Save Changes' : 'Promote User';


    return (
        <div 
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white border-4 border-black p-8 relative w-full max-w-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-black">{modalTitle}</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Select which chapter(s) <span className="font-bold">{userToManage.name}</span> will be responsible for organizing.
                    </p>
                </div>
                
                <div className="my-6">
                    {promotableChapters.length > 0 ? (
                        <div className="space-y-2 border border-black p-4 max-h-64 overflow-y-auto">
                            {promotableChapters.map(chapter => (
                                <label key={chapter.name} className="flex items-center space-x-3 p-2 hover:bg-neutral-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedChapters.includes(chapter.name)}
                                        onChange={() => handleCheckboxChange(chapter.name)}
                                        className="h-5 w-5 accent-[#d81313]"
                                    />
                                    <span className="font-bold text-black">{chapter.name}</span>
                                    <span className="text-sm text-neutral-500">({chapter.country})</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                         <div className="border border-black p-4 text-center bg-neutral-100">
                            <p className="font-bold text-black">No promotable chapters found.</p>
                             <p className="text-sm text-neutral-600 mt-1">
                                {currentUser?.role === Role.REGIONAL_ORGANISER
                                    ? `This user is not a member of any chapters within your managed region (${currentUser.managedCountry}).`
                                    : "This user is not a member of any chapters."
                                }
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onClose}
                        className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={promotableChapters.length === 0 || selectedChapters.length === 0}
                        className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromoteToOrganiserModal;
