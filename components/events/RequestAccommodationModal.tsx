import React, { useState } from 'react';
import { type User, type CubeEvent, type AccommodationRequest } from '../../types';

interface RequestAccommodationModalProps {
    host: User;
    event: CubeEvent;
    onClose: () => void;
    onCreateRequest: (data: Omit<AccommodationRequest, 'id'|'requester'|'host'|'event'|'status'>) => void;
}

const InputField: React.FC<{ label: string; id: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = 
({ label, id, type, value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-bold text-black mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required
            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
        />
    </div>
);

const RequestAccommodationModal: React.FC<RequestAccommodationModalProps> = ({ host, event, onClose, onCreateRequest }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !message) {
            alert("Please fill out all fields.");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date cannot be before start date.");
            return;
        }
        onCreateRequest({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            message,
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className="bg-white border-4 border-black p-8 relative w-full max-w-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-black">Request Stay with {host.name}</h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        You are requesting accommodation for the <span className="font-bold">{event.location}</span> event.
                    </p>
                </div>
                
                <div className="my-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Arrival Date" id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <InputField label="Departure Date" id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-bold text-black mb-1">Message to {host.name}</label>
                        <textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            placeholder="Introduce yourself, mention your travel plans, etc."
                            className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
                    >
                        Send Request
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestAccommodationModal;