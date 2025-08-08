import React from 'react';
import { type User } from '@/types';
import { calculateDiscountTier } from '@/utils/rewards';
import { TagIcon } from '@/icons';

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
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-black">{label}</span>
        <span className="text-xs font-medium text-neutral-500">
          {current} / {required}
        </span>
      </div>
      <div className="h-2 w-full border border-black bg-neutral-200">
        <div
          className="h-full bg-primary"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const DiscountTierProgress: React.FC<DiscountTierProgressProps> = ({
  user,
}) => {
  const { level, nextTier, progress } = calculateDiscountTier(user);

  return (
    <div className="border border-black bg-white p-6">
      <div className="mb-4 flex items-center border-b border-black pb-4">
        <div className="text-black">
          <TagIcon className="h-6 w-6" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-black">
            Current Tier: {level}
          </h3>
        </div>
      </div>

      {progress ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-neutral-600">
            Progress to {nextTier}:
          </p>
          <ProgressBar
            label="Cubes Attended"
            current={progress.cubes.current}
            required={progress.cubes.required}
          />
          <ProgressBar
            label="Cities"
            current={progress.cities.current}
            required={progress.cities.required}
          />
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
          <p className="font-bold text-black">
            You've reached the highest tier!
          </p>
          <p className="text-sm text-neutral-600">
            Thank you for your incredible dedication.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscountTierProgress;
