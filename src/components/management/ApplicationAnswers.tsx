import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type User } from '@/types';

interface ApplicationAnswersProps {
  user: User;
}

const ApplicationAnswers: React.FC<ApplicationAnswersProps> = ({ user }) => {
  if (!user.onboardingAnswers) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-bold">Why are you vegan?</Label>
          <p className="text-sm text-muted-foreground">
            {user.onboardingAnswers.veganReason}
          </p>
        </div>

        <div>
          <Label className="text-sm font-bold">Abolitionist Alignment</Label>
          <p className="text-sm text-muted-foreground">
            {user.onboardingAnswers.abolitionistAlignment ? 'Yes' : 'No'}
          </p>
        </div>

        {user.onboardingAnswers.customAnswer && (
          <div>
            <Label className="text-sm font-bold">Additional Information</Label>
            <p className="text-sm text-muted-foreground">
              {user.onboardingAnswers.customAnswer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationAnswers;
