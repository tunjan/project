import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { OnboardingStatus, type User } from '@/types';

import ApplicationAnswers from './ApplicationAnswers';

interface OnboardingProgressDetailsProps {
  user: User;
}

const OnboardingProgressDetails: React.FC<OnboardingProgressDetailsProps> = ({
  user,
}) => {
  const getStatusIcon = (status: OnboardingStatus, isCurrent: boolean) => {
    if (isCurrent) {
      return <Clock className="size-5 text-warning" />;
    }

    const completedStatuses = [
      OnboardingStatus.CONFIRMED,
      OnboardingStatus.COMPLETED,
    ];

    if (completedStatuses.includes(status)) {
      return <CheckCircle className="size-5 text-primary" />;
    }

    if (status === OnboardingStatus.DENIED) {
      return <AlertTriangle className="size-5 text-destructive" />;
    }

    return <UserIcon className="size-5 text-muted-foreground" />;
  };

  const getStatusColor = (status: OnboardingStatus, isCurrent: boolean) => {
    if (isCurrent) return 'text-warning';

    const completedStatuses = [
      OnboardingStatus.CONFIRMED,
      OnboardingStatus.COMPLETED,
    ];

    if (completedStatuses.includes(status)) return 'text-primary';
    if (status === OnboardingStatus.DENIED) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getStatusDescription = (status: OnboardingStatus) => {
    switch (status) {
      case OnboardingStatus.PENDING_APPLICATION_REVIEW:
        return 'Application submitted and awaiting review by organizers';
      case OnboardingStatus.PENDING_ONBOARDING_CALL:
        return 'Application approved, waiting for onboarding call to be scheduled';
      case OnboardingStatus.AWAITING_FIRST_CUBE:
        return 'Onboarding call completed, waiting for first cube participation';
      case OnboardingStatus.AWAITING_MASTERCLASS:
        return 'First cube completed, waiting for masterclass completion';
      case OnboardingStatus.AWAITING_REVISION_CALL:
        return 'Masterclass completed, waiting for revision call';
      case OnboardingStatus.CONFIRMED:
        return 'Onboarding completed, member is fully confirmed';
      case OnboardingStatus.COMPLETED:
        return 'All onboarding requirements completed';
      case OnboardingStatus.DENIED:
        return 'Application was denied';
      case OnboardingStatus.INACTIVE:
        return 'Member marked as inactive';
      default:
        return 'Unknown status';
    }
  };

  const onboardingSteps = [
    OnboardingStatus.PENDING_APPLICATION_REVIEW,
    OnboardingStatus.PENDING_ONBOARDING_CALL,
    OnboardingStatus.AWAITING_FIRST_CUBE,
    OnboardingStatus.AWAITING_MASTERCLASS,
    OnboardingStatus.AWAITING_REVISION_CALL,
    OnboardingStatus.CONFIRMED,
    OnboardingStatus.COMPLETED,
  ];

  const currentStepIndex = onboardingSteps.indexOf(user.onboardingStatus);
  const isDenied = user.onboardingStatus === OnboardingStatus.DENIED;
  const isInactive = user.onboardingStatus === OnboardingStatus.INACTIVE;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
      </Card>

      {/* Current Status Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            {getStatusIcon(user.onboardingStatus, true)}
            <div>
              <h4 className="text-lg font-bold">Current Status</h4>
              <p
                className={`text-lg font-semibold ${getStatusColor(user.onboardingStatus, true)}`}
              >
                {user.onboardingStatus}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            {getStatusDescription(user.onboardingStatus)}
          </p>

          {/* Progress Bar */}
          {!isDenied && !isInactive && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <Label>Progress</Label>
                <span className="font-semibold">
                  {Math.round(
                    ((currentStepIndex + 1) / onboardingSteps.length) * 100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={((currentStepIndex + 1) / onboardingSteps.length) * 100}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Journey */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {onboardingSteps.map((step, index) => {
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step} className="flex items-start gap-4">
                <div className="shrink-0">{getStatusIcon(step, isCurrent)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${getStatusColor(step, isCurrent)}`}
                    >
                      {step}
                    </span>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getStatusDescription(step)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Denied Status */}
          {isDenied && (
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {getStatusIcon(OnboardingStatus.DENIED, false)}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-destructive">
                  Application Denied
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  The application was reviewed and denied by organizers
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Details */}
      {user.onboardingProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Masterclass Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center ${
                    user.onboardingProgress.watchedMasterclass
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  }`}
                >
                  <GraduationCap
                    className={`size-5 ${
                      user.onboardingProgress.watchedMasterclass
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold">Masterclass</Label>
                  <p
                    className={`font-semibold ${
                      user.onboardingProgress.watchedMasterclass
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {user.onboardingProgress.watchedMasterclass
                      ? 'Completed'
                      : 'Not Completed'}
                  </p>
                </div>
              </div>

              {/* Selected Organizer */}
              {user.onboardingProgress.selectedOrganiserId && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10">
                    <UserIcon className="size-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">
                      Selected Organizer
                    </Label>
                    <p className="font-semibold">
                      ID: {user.onboardingProgress.selectedOrganiserId}
                    </p>
                  </div>
                </div>
              )}

              {/* Onboarding Call */}
              {user.onboardingProgress.onboardingCallScheduledAt && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-warning/10">
                    <Phone className="size-5 text-warning" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Onboarding Call</Label>
                    <p className="font-semibold">
                      {new Date(
                        user.onboardingProgress.onboardingCallScheduledAt
                      ).toLocaleDateString()}
                    </p>
                    {user.onboardingProgress.onboardingCallContactInfo && (
                      <p className="text-sm text-muted-foreground">
                        Contact:{' '}
                        {user.onboardingProgress.onboardingCallContactInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Revision Call */}
              {user.onboardingProgress.revisionCallScheduledAt && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10">
                    <Phone className="size-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Revision Call</Label>
                    <p className="font-semibold">
                      {new Date(
                        user.onboardingProgress.revisionCallScheduledAt
                      ).toLocaleDateString()}
                    </p>
                    {user.onboardingProgress.revisionCallContactInfo && (
                      <p className="text-sm text-muted-foreground">
                        Contact:{' '}
                        {user.onboardingProgress.revisionCallContactInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Answers - Only show for approved members */}
      {user.onboardingAnswers &&
        user.onboardingStatus !== OnboardingStatus.PENDING_APPLICATION_REVIEW &&
        user.onboardingStatus !== OnboardingStatus.DENIED && (
          <ApplicationAnswers user={user} />
        )}

      {/* Join Date */}
      {user.joinDate && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-primary/10">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-bold">Member Since</Label>
                <p className="font-semibold">
                  {new Date(user.joinDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(
                    (Date.now() - new Date(user.joinDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnboardingProgressDetails;
