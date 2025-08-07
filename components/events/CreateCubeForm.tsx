import React, { useState } from 'react';
import { type User, Role, type Chapter } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface CreateCubeFormProps {
    onCreateEvent: (eventData: { city: string; location: string; dateTime: Date }) => void;
    onCancel: () => void;
}

const InputField: React.FC<{ label: string; id: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = 
({ label, id, type = "text", value, onChange, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-black mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
        />
    </div>
);

const CreateCubeForm: React.FC<CreateCubeFormProps> = ({ onCreateEvent, onCancel }) => {
    const { currentUser } = useAuth();
    const { chapters } = useData();

    if (!currentUser) return null;

    const isHighLevelOrganizer = [Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN, Role.GODMODE].includes(currentUser.role);
    const organizerChapters = isHighLevelOrganizer ? chapters.map(c => c.name) : (currentUser.organiserOf || []);
    
    const [city, setCity] = useState(organizerChapters[0] || '');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            alert("Please select a valid date and time.");
            return;
        }
         if (!city) {
            alert("Please select a city.");
            return;
        }
        const dateTime = new Date(`${date}T${time}`);
        onCreateEvent({ city, location, dateTime });
    };

    return (
        <div className="py-8 md:py-16">
            <div className="max-w-2xl mx-auto bg-white border border-black">
                <div className="p-8 border-b border-black">
                    <h1 className="text-3xl font-extrabold text-black">Create a New Cube</h1>
                    <p className="mt-2 text-neutral-600">
                       Fill in the details below to schedule a new event. It will be visible to all members immediately.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label htmlFor="city" className="block text-sm font-bold text-black mb-1">City</label>
                        <select
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
                            disabled={organizerChapters.length === 0}
                        >
                            <option value="" disabled>Select a city</option>
                            {organizerChapters.map(chapterName => (
                                <option key={chapterName} value={chapterName}>{chapterName}</option>
                            ))}
                        </select>
                         {organizerChapters.length === 0 && (
                            <p className="text-xs text-neutral-500 mt-1">You are not an organiser of any chapter. Contact an admin.</p>
                        )}
                    </div>

                    <InputField label="Exact Location (e.g., Times Square, Union Square)" id="location" value={location} onChange={e => setLocation(e.target.value)} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Date" id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        <InputField label="Time" id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
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
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCubeForm;