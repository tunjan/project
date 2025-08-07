import React, { useState } from 'react';
import { type OnboardingAnswers, type Chapter } from '../../types';
import { useData } from '../../contexts/DataContext';

interface SignUpProps {
    onRegister: (formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => void;
    onNavigateLogin: () => void;
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

const TextAreaField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean; rows?: number }> = 
({ label, id, value, onChange, required = true, rows = 3 }) => (
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

const SignUp: React.FC<SignUpProps> = ({ onRegister, onNavigateLogin }) => {
    const { chapters } = useData();
    const [name, setName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [chapter, setChapter] = useState(chapters[0]?.name || '');
    const [veganReason, setVeganReason] = useState('');
    const [abolitionistAlignment, setAbolitionistAlignment] = useState(false);
    const [customAnswer, setCustomAnswer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister({
            name,
            instagram,
            chapter,
            answers: { veganReason, abolitionistAlignment, customAnswer }
        });
    };

    return (
        <div className="py-8 md:py-16">
            <div className="max-w-2xl mx-auto bg-white border border-black">
                <div className="p-8 border-b border-black">
                    <h1 className="text-3xl font-extrabold text-black">Join the Movement</h1>
                    <p className="mt-2 text-neutral-600">
                       Complete the application below. An organizer from your selected chapter will review it.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <InputField label="Full Name" id="name" value={name} onChange={e => setName(e.target.value)} />
                    <InputField label="Instagram Handle (Optional)" id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} required={false} />

                    <div>
                        <label htmlFor="chapter" className="block text-sm font-bold text-black mb-1">Local Chapter</label>
                        <select 
                             id="chapter" 
                             value={chapter} 
                             onChange={e => setChapter(e.target.value)}
                             className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
                        >
                            {chapters.map(ch => <option key={ch.name} value={ch.name}>{ch.name}</option>)}
                        </select>
                    </div>

                    <hr className="border-black"/>

                    <TextAreaField label="Why did you go vegan?" id="veganReason" value={veganReason} onChange={e => setVeganReason(e.target.value)} />
                    
                    <fieldset>
                        <legend className="text-sm font-bold text-black mb-2">Are you aligned with our abolitionist values (a consistent anti-oppression stance)?</legend>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input type="radio" name="abolitionist" onChange={() => setAbolitionistAlignment(true)} className="accent-[#d81313]"/>
                                <span>Yes</span>
                            </label>
                             <label className="flex items-center space-x-2">
                                <input type="radio" name="abolitionist" defaultChecked onChange={() => setAbolitionistAlignment(false)} className="accent-[#d81313]"/>
                                <span>No / Unsure</span>
                            </label>
                        </div>
                    </fieldset>

                    <TextAreaField label="How can you best contribute to your local chapter? (e.g., skills, availability)" id="customAnswer" value={customAnswer} onChange={e => setCustomAnswer(e.target.value)} />
                    
                    <div className="pt-4">
                       <button type="submit" className="w-full bg-[#d81313] text-white font-bold py-3 px-4 hover:bg-[#b81010] transition-colors duration-300">
                            Submit Application
                        </button>
                    </div>

                    <p className="text-center text-sm text-neutral-600">
                        Already have an account?{' '}
                        <button type="button" onClick={onNavigateLogin} className="font-bold text-[#d81313] hover:underline">
                            Log In
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
