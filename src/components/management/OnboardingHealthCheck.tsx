import React, { useState, useEffect } from 'react';
import { useUsers, useUsersActions } from '@/store';
import { OnboardingStatus } from '@/types';
import { ExclamationTriangleIcon, CheckCircleIcon, WrenchIcon } from '@/icons';

const OnboardingHealthCheck: React.FC = () => {
  const users = useUsers();
  const { validateUserOnboarding, fixOnboardingIssues } = useUsersActions();
  const [issues, setIssues] = useState<
    Array<{ userId: string; name: string; issues: string[] }>
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const checkOnboardingHealth = () => {
    setIsChecking(true);
    const userIssues: Array<{
      userId: string;
      name: string;
      issues: string[];
    }> = [];

    users.forEach((user) => {
      const validation = validateUserOnboarding(user.id);
      if (!validation.isValid) {
        userIssues.push({
          userId: user.id,
          name: user.name,
          issues: validation.issues,
        });
      }
    });

    setIssues(userIssues);
    setIsChecking(false);
  };

  const handleFixIssues = async () => {
    setIsFixing(true);
    fixOnboardingIssues();

    // Wait a bit and then re-check
    setTimeout(() => {
      checkOnboardingHealth();
      setIsFixing(false);
    }, 1000);
  };

  useEffect(() => {
    checkOnboardingHealth();
  }, [users]);

  const getStatusCounts = () => {
    const counts = Object.values(OnboardingStatus).reduce(
      (acc, status) => {
        acc[status] = users.filter((u) => u.onboardingStatus === status).length;
        return acc;
      },
      {} as Record<string, number>
    );
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">
          Onboarding Health Check
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={checkOnboardingHealth}
            disabled={isChecking}
            className="btn-info btn-sm"
          >
            {isChecking ? 'Checking...' : 'Refresh'}
          </button>
          <button
            onClick={handleFixIssues}
            disabled={isFixing || issues.length === 0}
            className="btn-warning btn-sm"
          >
            {isFixing ? 'Fixing...' : 'Fix Issues'}
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="border-2 border-black bg-white p-4 text-center transition-all hover:bg-neutral-100"
          >
            <div className="text-2xl font-bold text-black">{count}</div>
            <div className="text-xs text-neutral-600">{status}</div>
          </div>
        ))}
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <div className="border-red border-2 bg-red-50 p-4">
          <div className="mb-4 flex items-center space-x-2">
            <ExclamationTriangleIcon className="text-red h-6 w-6" />
            <h3 className="text-red text-lg font-bold">
              {issues.length} User{issues.length !== 1 ? 's' : ''} with
              Onboarding Issues
            </h3>
          </div>

          <div className="space-y-3">
            {issues.map(({ userId, name, issues: userIssues }) => (
              <div key={userId} className="border-red border bg-white p-3">
                <div className="font-semibold text-black">{name}</div>
                <ul className="mt-2 space-y-1">
                  {userIssues.map((issue, index) => (
                    <li key={index} className="text-red text-sm">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-green border-2 bg-green-50 p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircleIcon className="text-green h-6 w-6" />
            <span className="text-green text-lg font-bold">
              All users have valid onboarding states!
            </span>
          </div>
        </div>
      )}

      {/* Auto-fix Info */}
      <div className="border-blue border-2 bg-blue-50 p-4">
        <div className="flex items-center space-x-2">
          <WrenchIcon className="text-blue h-6 w-6" />
          <h3 className="text-blue text-lg font-bold">Auto-Fix Capabilities</h3>
        </div>
        <p className="mt-2 text-sm text-blue-800">
          The "Fix Issues" button will automatically attempt to resolve common
          onboarding problems:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>
            • Advance users who have completed requirements but haven't been
            moved to the next status
          </li>
          <li>
            • Fix status mismatches (e.g., users marked as awaiting masterclass
            who have already watched it)
          </li>
          <li>• Ensure proper progression through the onboarding pipeline</li>
        </ul>
      </div>
    </div>
  );
};

export default OnboardingHealthCheck;
