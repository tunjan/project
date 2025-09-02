import React from 'react';

import { type User } from '@/types';

interface ApplicationAnswersProps {
  user: User;
}

const ApplicationAnswers: React.FC<ApplicationAnswersProps> = ({ user }) => {
  if (!user.onboardingAnswers) {
    return null;
  }

  return (
    <div className="rounded-none border-black bg-white p-6 md:border-2">
      <h4 className="mb-4 text-lg font-bold text-black">Application Answers</h4>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-bold text-neutral-600">
            Why are you vegan?
          </p>
          <p className="text-black">{user.onboardingAnswers.veganReason}</p>
        </div>

        <div>
          <p className="text-sm font-bold text-neutral-600">
            Abolitionist Alignment
          </p>
          <p className="text-black">
            {user.onboardingAnswers.abolitionistAlignment ? 'Yes' : 'No'}
          </p>
        </div>

        {user.onboardingAnswers.customAnswer && (
          <div>
            <p className="text-sm font-bold text-neutral-600">
              Additional Information
            </p>
            <p className="text-black">{user.onboardingAnswers.customAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationAnswers;
