import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { InputField, SelectField, TextAreaField } from '@/components/ui';
import { CheckIcon } from '@/icons';
import { type Chapter, type OnboardingAnswers } from '@/types';

// 1. Define the validation schema with Zod
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  instagram: z.string().optional(),
  chapter: z.string().min(1, 'Please select a chapter'),
  veganReason: z
    .string()
    .min(10, 'Please provide a reason (min. 10 characters)'),
  // Radio button values are strings, so we transform them to boolean
  abolitionistAlignment: z
    .enum(['true', 'false'], {
      errorMap: () => ({ message: 'Please select an option' }),
    })
    .transform((val) => val === 'true'),
  customAnswer: z
    .string()
    .min(10, 'Please provide an answer (min. 10 characters)'),
});

// 2. Infer the TypeScript type from the schema
type SignUpFormSchema = z.infer<typeof signUpSchema>;

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
  defaultChapter?: string;
}

const SignUp: React.FC<SignUpProps> = ({
  chapters,
  onRegister,
  onNavigateLogin,
  defaultChapter,
}) => {
  // 3. Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      chapter: defaultChapter || chapters[0]?.name || '',
    },
    mode: 'onChange', // Change back to onChange to enable real-time validation
  });

  // Helper function to check if a field is valid using react-hook-form state

  // 4. Create a submit handler that receives validated data
  const onSubmit: SubmitHandler<SignUpFormSchema> = (data) => {
    // Restructure the flat form data to match the expected nested structure for onRegister
    onRegister({
      name: data.name,
      email: data.email,
      instagram: data.instagram || '',
      chapter: data.chapter,
      answers: {
        veganReason: data.veganReason,
        abolitionistAlignment: data.abolitionistAlignment,
        customAnswer: data.customAnswer,
      },
    });
  };

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl border border-black bg-white">
        <div className="border-b border-black p-8">
          <h1 className="text-2xl font-extrabold text-black sm:text-3xl">
            Join the Movement
          </h1>
          <p className="mt-2 text-neutral-600">
            Complete the application below. An organizer from your selected
            chapter will review it.
          </p>
        </div>
        {/* 5. Connect handleSubmit to the form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
          {/* 6. Connect fields with `register` and pass errors */}
          <InputField
            label="Full Name"
            id="name"
            {...register('name')}
            error={errors.name?.message}
          />
          <InputField
            label="Email Address"
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <InputField
            label="Instagram Handle (Optional)"
            id="instagram"
            {...register('instagram')}
            error={errors.instagram?.message}
          />
          <SelectField
            label="Local Chapter"
            id="chapter"
            {...register('chapter')}
            error={errors.chapter?.message}
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
            {...register('veganReason')}
            rows={3}
            error={errors.veganReason?.message}
          />

          <fieldset className="relative">
            <legend className="mb-2 text-sm font-bold text-black">
              Are you aligned with our abolitionist values (a consistent
              anti-oppression stance)?
            </legend>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="true"
                  {...register('abolitionistAlignment')}
                  className="accent-primary"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="false"
                  {...register('abolitionistAlignment')}
                  className="accent-primary"
                />
                <span>No / Unsure</span>
              </label>
            </div>
            {errors.abolitionistAlignment && (
              <p className="mt-1 text-xs font-semibold text-primary">
                {errors.abolitionistAlignment.message}
              </p>
            )}
            {/* Show checkmark for radio button selection */}
            {!errors.abolitionistAlignment && (
              <div className="absolute right-0 top-0 flex items-center text-success">
                <CheckIcon className="mr-1 size-4" />
                <span className="text-xs font-medium">✓</span>
              </div>
            )}
          </fieldset>

          <TextAreaField
            label="How can you best contribute to your local chapter? (e.g., skills, availability)"
            id="customAnswer"
            {...register('customAnswer')}
            rows={3}
            error={errors.customAnswer?.message}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0}
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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
