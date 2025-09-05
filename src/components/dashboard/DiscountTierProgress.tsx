import { Tag } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type User } from '@/types';
import { calculateDiscountTier } from '@/utils';

interface DiscountTierProgressProps {
  user: User;
}

const ProgressBar: React.FC<{
  label: string;
  current: number;
  required: number;
}> = ({ label, current, required }) => {
  const percentage = Math.min((current / required) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {current} / {required}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

const DiscountTierProgress: React.FC<DiscountTierProgressProps> = ({
  user,
}) => {
  const { level, nextTier, progress } = calculateDiscountTier(user);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Tag className="size-6 text-primary" />
          Current Tier: {level}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {progress ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground">
              Progress to {nextTier}:
            </p>
            {progress.cubes && (
              <ProgressBar
                label="Cubes Attended"
                current={progress.cubes.current}
                required={progress.cubes.required}
              />
            )}
            {progress.cities && (
              <ProgressBar
                label="Cities"
                current={progress.cities.current}
                required={progress.cities.required}
              />
            )}
            {progress.hours && (
              <ProgressBar
                label="Hours Contributed"
                current={progress.hours.current}
                required={progress.hours.required}
              />
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="font-bold text-foreground">
              You've reached the highest tier!
            </p>
            <p className="text-sm text-muted-foreground">
              Thank you for your incredible dedication.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountTierProgress;
