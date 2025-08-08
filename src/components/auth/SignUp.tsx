import React, { useReducer } from 'react';
import { type OnboardingAnswers, type Chapter } from '@/types';
import { InputField, TextAreaField, SelectField } from '@/components/ui/Form';

// --- Form State Management ---
interface FormState {
  name: string;
  email: string;
  instagram: string;
  chapter: string;
  veganReason: string;
  abolitionistAlignment: boolean;
  customAnswer: string;
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...action.value }; // expects a full initial state object
    default:
      return state;
  }
};

interface SignUpProps {
  chapters: Chapter[];
  onRegister: (formData: {
    name: string;
    email: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => void;
  onNavigateLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({
  chapters,
  onRegister,
  onNavigateLogin,
}) => {
  const initialState: FormState = {
    name: '',
    email: '',
    instagram: '',
    chapter: chapters[0]?.name || '',
    veganReason: '',
    abolitionistAlignment: false,
    customAnswer: '',
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleFieldChange = (
    field: keyof FormState,
    value: string | boolean
  ) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      name: state.name,
      email: state.email,
      instagram: state.instagram,
      chapter: state.chapter,
      answers: {
        veganReason: state.veganReason,
        abolitionistAlignment: state.abolitionistAlignment,
        customAnswer: state.customAnswer,
      },
    });
  };

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl border border-black bg-white">
        <div className="border-b border-black p-8">
          <h1 className="text-3xl font-extrabold text-black">
            Join the Movement
          </h1>
          <p className="mt-2 text-neutral-600">
            Complete the application below. An organizer from your selected
            chapter will review it.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <InputField
            label="Full Name"
            id="name"
            value={state.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            required
          />
          <InputField
            label="Email Address"
            id="email"
            type="email"
            value={state.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            required
          />
          <InputField
            label="Instagram Handle (Optional)"
            id="instagram"
            value={state.instagram}
            onChange={(e) => handleFieldChange('instagram', e.target.value)}
          />

          <SelectField
            label="Local Chapter"
            id="chapter"
            value={state.chapter}
            onChange={(e) => handleFieldChange('chapter', e.target.value)}
          >
            {chapters.map((ch) => (
              <option key={ch.name} value={ch.name}>
                {ch.name}
              </option>
            ))}
          </SelectField>

          <hr className="border-black" />

          <TextAreaField
            label="Why did you go vegan?"
            id="veganReason"
            value={state.veganReason}
            onChange={(e) => handleFieldChange('veganReason', e.target.value)}
            rows={3}
            required
          />

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-black">
              Are you aligned with our abolitionist values (a consistent
              anti-oppression stance)?
            </legend>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="abolitionist"
                  checked={state.abolitionistAlignment === true}
                  onChange={() =>
                    handleFieldChange('abolitionistAlignment', true)
                  }
                  className="accent-primary"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="abolitionist"
                  checked={state.abolitionistAlignment === false}
                  onChange={() =>
                    handleFieldChange('abolitionistAlignment', false)
                  }
                  className="accent-primary"
                />
                <span>No / Unsure</span>
              </label>
            </div>
          </fieldset>

          <TextAreaField
            label="How can you best contribute to your local chapter? (e.g., skills, availability)"
            id="customAnswer"
            value={state.customAnswer}
            onChange={(e) => handleFieldChange('customAnswer', e.target.value)}
            rows={3}
            required
          />

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              Submit Application
            </button>
          </div>

          <p className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-bold text-primary hover:underline"
            >
              Log In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
