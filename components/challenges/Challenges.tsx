import React from 'react';
import { mockChallenges } from './mockData';
import { TrophyIcon, CalendarIcon } from '../icons';

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-neutral-200 h-2.5 border border-black">
            <div 
                className="bg-[#d81313] h-2" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const Challenges = () => {
    const challenges = mockChallenges;

    return (
        <section className="py-12">
            <h2 className="text-3xl font-extrabold text-black tracking-tight border-b-2 border-[#d81313] pb-3 mb-6">Team-Based Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white border border-black p-6">
                        <h3 className="text-xl font-bold text-black">{challenge.title}</h3>
                        <p className="text-neutral-600 mt-2 mb-4 text-sm">{challenge.description}</p>
                        
                        <div className="flex items-center text-sm text-neutral-500 mb-4">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span>Ends: {challenge.endDate.toLocaleDateString()}</span>
                        </div>

                        <div>
                            <h4 className="text-md font-semibold text-black mb-2">Leaderboard</h4>
                            <div className="space-y-3">
                                {challenge.participants.map((p, index) => (
                                    <div key={p.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center">
                                                {index === 0 && <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2"/>}
                                                <span className={`font-semibold ${index === 0 ? 'text-[#d81313]' : 'text-black'}`}>{p.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-neutral-700">{p.progress.toLocaleString()} {challenge.metric}</span>
                                        </div>
                                        <ProgressBar value={p.progress} max={challenge.goal} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Challenges;
