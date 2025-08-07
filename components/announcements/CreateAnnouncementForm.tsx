import React, { useState, useEffect } from 'react';
import { type User, AnnouncementScope, Role, type Chapter } from '../../types';
import { getPostableScopes } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface CreateAnnouncementFormProps {
    onCreate: (data: { title: string; content: string; scope: AnnouncementScope; target?: string }) => void;
    onCancel: () => void;
}

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = 
({ label, id, value, onChange, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-black mb-1">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
        />
    </div>
);

const TextAreaField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean; rows?: number }> = 
({ label, id, value, onChange, required = true, rows = 8 }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-black mb-1">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
        />
    </div>
);

const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; disabled?: boolean }> =
({ label, id, value, onChange, children, disabled=false }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-bold text-black mb-1">{label}</label>
        <select 
            id={id} 
            value={value} 
            onChange={onChange}
            disabled={disabled}
            className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm disabled:bg-neutral-200"
        >
            {children}
        </select>
    </div>
);

const CreateAnnouncementForm: React.FC<CreateAnnouncementFormProps> = ({ onCreate, onCancel }) => {
    const { currentUser } = useAuth();
    const { chapters } = useData();
    
    if (!currentUser) return null;

    const postableScopes = getPostableScopes(currentUser);
    const availableChapters = (currentUser.role === Role.CHAPTER_ORGANISER) ? (currentUser.organiserOf || []) : chapters.map(c => c.name);
    const availableCountries = (currentUser.role === Role.REGIONAL_ORGANISER) ? [currentUser.managedCountry || ''] : [...new Set(chapters.map(c => c.country))];


    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [scope, setScope] = useState<AnnouncementScope>(postableScopes[0]);
    const [target, setTarget] = useState('');

    useEffect(() => {
        // When scope changes, pre-select the first available target for convenience.
        if (scope === AnnouncementScope.CHAPTER) {
            if (availableChapters.length > 0) setTarget(availableChapters[0]);
            else setTarget('');
        } else if (scope === AnnouncementScope.REGIONAL) {
            if (availableCountries.length > 0) setTarget(availableCountries[0]);
             else setTarget('');
        }
        else {
            setTarget('');
        }
    }, [scope, currentUser]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((scope === AnnouncementScope.CHAPTER || scope === AnnouncementScope.REGIONAL) && !target) {
            alert(`Please select a target ${scope.toLowerCase()}.`);
            return;
        }
        onCreate({ title, content, scope, target });
    };

    return (
        <div className="py-8 md:py-16">
            <div className="max-w-3xl mx-auto bg-white border border-black">
                <div className="p-8 border-b border-black">
                    <h1 className="text-3xl font-extrabold text-black">Create Announcement</h1>
                    <p className="mt-2 text-neutral-600">
                       Your message will be visible to the audience defined by the selected scope.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <InputField label="Title" id="title" value={title} onChange={e => setTitle(e.target.value)} />
                    <TextAreaField label="Content" id="content" value={content} onChange={e => setContent(e.target.value)} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Scope" id="scope" value={scope} onChange={e => setScope(e.target.value as AnnouncementScope)}>
                             {postableScopes.map(s => <option key={s} value={s}>{s}</option>)}
                        </SelectField>

                        {scope === AnnouncementScope.REGIONAL && (
                            <SelectField 
                                label="Target Region" 
                                id="target-region" 
                                value={target} 
                                onChange={e => setTarget(e.target.value)}
                                disabled={currentUser.role === Role.REGIONAL_ORGANISER}
                            >
                                <option value="">Select Region</option>
                                {availableCountries.map(r => <option key={r} value={r}>{r}</option>)}
                            </SelectField>
                        )}
                         {scope === AnnouncementScope.CHAPTER && (
                            <SelectField label="Target Chapter" id="target-chapter" value={target} onChange={e => setTarget(e.target.value)}>
                                <option value="">Select Chapter</option>
                                {availableChapters.map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectField>
                        )}
                    </div>
                    
                    <div className="pt-4 flex items-center space-x-4">
                       <button 
                         type="button" 
                         onClick={onCancel}
                         className="w-full bg-black text-white font-bold py-3 px-4 hover:bg-neutral-800 transition-colors duration-300"
                       >
                            Cancel
                        </button>
                        <button 
                           type="submit" 
                           className="w-full bg-[#d81313] text-white font-bold py-3 px-4 hover:bg-[#b81010] transition-colors duration-300"
                        >
                            Publish Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncementForm;
