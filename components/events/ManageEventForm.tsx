import React, { useState } from 'react';
import { type CubeEvent, type EventReport } from '../../types';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon } from '../icons';

interface ManageEventFormProps {
    event: CubeEvent;
    onLogReport: (eventId: string, report: EventReport) => void;
    onCancel: () => void;
}

type AttendanceStatus = 'Attended' | 'Absent';

const ManageEventForm: React.FC<ManageEventFormProps> = ({ event, onLogReport, onCancel }) => {
    const [hours, setHours] = useState<number | ''>('');
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
        // Default everyone who RSVP'd to 'Attended'
        const initialAttendance: Record<string, AttendanceStatus> = {};
        event.participants.forEach(p => {
            initialAttendance[p.user.id] = 'Attended';
        });
        return initialAttendance;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hours === '' || hours <= 0) {
            alert('Please enter a valid duration in hours.');
            return;
        }
        const reportData: EventReport = {
            hours: Number(hours),
            attendance,
        };
        onLogReport(event.id, reportData);
    };

    const toggleAttendance = (userId: string) => {
        setAttendance(prev => ({
            ...prev,
            [userId]: prev[userId] === 'Attended' ? 'Absent' : 'Attended',
        }));
    };

    return (
        <div className="py-8 md:py-12 animate-fade-in">
            <div className="mb-6">
                <button onClick={onCancel} className="inline-flex items-center text-sm font-semibold text-[#d81313] hover:text-black transition">
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to Event
                </button>
            </div>
            <div className="max-w-4xl mx-auto bg-white border border-black">
                <div className="p-8 border-b border-black">
                    <h1 className="text-3xl font-extrabold text-black">Log Event Report</h1>
                    <p className="mt-2 text-neutral-600">
                       Submit the final details for <span className="font-bold">{event.location}</span> in <span className="font-bold">{event.city}</span>. This will update stats for all attendees.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Impact Stats */}
                    <div className="p-8 border-b border-black">
                        <h2 className="text-xl font-bold text-black mb-4">Impact Metrics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="hours" className="block text-sm font-bold text-black mb-1">Event Duration (Hours)</label>
                                <input
                                    type="number"
                                    id="hours"
                                    value={hours}
                                    onChange={e => setHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    required
                                    min="0.1"
                                    step="0.1"
                                    className="block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm"
                                    placeholder="e.g., 4.5"
                                />
                            </div>
                             <div>
                                {/* Conversion input removed to centralize tracking */}
                            </div>
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-black mb-4">Attendance</h2>
                        <ul className="divide-y divide-black border-t border-b border-black">
                            {event.participants.map(({ user }) => (
                                <li key={user.id} className="flex items-center justify-between p-3">
                                    <div className="flex items-center space-x-4">
                                        <img src={user.profilePictureUrl} alt={user.name} className="w-10 h-10 object-cover"/>
                                        <div>
                                            <p className="font-bold text-black">{user.name}</p>
                                            <p className="text-sm text-neutral-500">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleAttendance(user.id)}
                                            className={`flex items-center justify-center w-28 text-sm font-semibold px-3 py-2 transition-colors ${
                                                attendance[user.id] === 'Attended'
                                                ? 'bg-[#d81313] text-white'
                                                : 'bg-neutral-200 text-black hover:bg-neutral-300'
                                            }`}
                                        >
                                            <CheckCircleIcon className="w-5 h-5 mr-1.5" />
                                            Attended
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleAttendance(user.id)}
                                            className={`flex items-center justify-center w-28 text-sm font-semibold px-3 py-2 transition-colors ${
                                                attendance[user.id] === 'Absent'
                                                ? 'bg-black text-white'
                                                : 'bg-neutral-200 text-black hover:bg-neutral-300'
                                            }`}
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-1.5" />
                                            Absent
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="p-8 border-t border-black">
                        <button 
                           type="submit" 
                           className="w-full bg-[#d81313] text-white font-bold py-3 px-4 hover:bg-[#b81010] transition-colors duration-300"
                        >
                            Submit Final Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageEventForm;