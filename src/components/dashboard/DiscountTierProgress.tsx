import React from "react";
import { type User } from "@/types";
import { calculateDiscountTier } from "@/utils/rewards";
import { TagIcon } from "@/icons";

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
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-semibold text-black">{label}</span>
        <span className="text-xs font-medium text-neutral-500">
          {current} / {required}
        </span>
      </div>
      <div className="w-full bg-neutral-200 h-2 border border-black">
        <div
          className="bg-[#d81313] h-full"
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
    <div className="bg-white border border-black p-6">
      <div className="flex items-center border-b border-black pb-4 mb-4">
        <div className="text-black">
          <TagIcon className="w-6 h-6" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-black">
            Current Tier: {level}
          </h3>
        </div>
      </div>

      {progress ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 font-semibold">
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
        <div className="text-center py-4">
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
