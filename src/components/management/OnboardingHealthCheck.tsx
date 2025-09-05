import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers, useUsersActions } from '@/store';
import { OnboardingStatus } from '@/types';

const OnboardingHealthCheck: React.FC = () => {
  const users = useUsers();
  const { validateUserOnboarding, fixOnboardingIssues } = useUsersActions();
  const [issues, setIssues] = useState<
    Array<{ userId: string; name: string; issues: string[] }>
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const checkOnboardingHealth = useCallback(() => {
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
  }, [users, validateUserOnboarding]);

  const handleFixIssues = async () => {
    setIsFixing(true);
    fixOnboardingIssues();

    setTimeout(() => {
      checkOnboardingHealth();
      setIsFixing(false);
    }, 1000);
  };

  useEffect(() => {
    checkOnboardingHealth();
  }, [users, checkOnboardingHealth]);

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
        <h2 className="text-2xl font-bold text-foreground">
          Onboarding Health Check
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={checkOnboardingHealth}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? 'Checking...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleFixIssues}
            disabled={isFixing || issues.length === 0}
            variant="secondary"
            size="sm"
          >
            {isFixing ? 'Fixing...' : 'Fix Issues'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card
            key={status}
            className="text-center transition-all hover:bg-accent"
          >
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="size-6" />
              <span>
                {issues.length} User{issues.length !== 1 ? 's' : ''} with
                Onboarding Issues
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map(({ userId, name, issues: userIssues }) => (
                <Card key={userId} className="border-destructive/20">
                  <CardContent className="p-3">
                    <div className="font-semibold text-foreground">{name}</div>
                    <ul className="mt-2 space-y-1">
                      {userIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-destructive">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500 bg-green-50 text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="size-6 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                All users have valid onboarding states!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-fix Info */}
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-600">
            <Wrench className="size-6" />
            <span>Auto-Fix Capabilities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800">
            The "Fix Issues" button will automatically attempt to resolve common
            onboarding problems:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>
              • Advance users who have completed requirements but haven't been
              moved to the next status
            </li>
            <li>
              • Fix status mismatches (e.g., users marked as awaiting
              masterclass who have already watched it)
            </li>
            <li>• Ensure proper progression through the onboarding pipeline</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingHealthCheck;
