import React from 'react';

import {
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon,
} from '@/icons';
import { OnboardingStatus, type User } from '@/types';

interface OnboardingProgressDetailsProps {
  user: User;
}

const OnboardingProgressDetails: React.FC<OnboardingProgressDetailsProps> = ({
  user,
}) => {
  const getStatusIcon = (status: OnboardingStatus, isCurrent: boolean) => {
    if (isCurrent) {
      return <ClockIcon className="size-5 text-warning" />;
    }

    const completedStatuses = [
      OnboardingStatus.CONFIRMED,
      OnboardingStatus.COMPLETED,
    ];

    if (completedStatuses.includes(status)) {
      return <CheckCircleIcon className="size-5 text-success" />;
    }

    if (status === OnboardingStatus.DENIED) {
      return <ExclamationTriangleIcon className="size-5 text-danger" />;
    }

    return <UserIcon className="size-5 text-neutral-400" />;
  };

  const getStatusColor = (status: OnboardingStatus, isCurrent: boolean) => {
    if (isCurrent) return 'text-warning';

    const completedStatuses = [
      OnboardingStatus.CONFIRMED,
      OnboardingStatus.COMPLETED,
    ];

    if (completedStatuses.includes(status)) return 'text-success';
    if (status === OnboardingStatus.DENIED) return 'text-danger';
    return 'text-neutral-500';
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
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">
          Onboarding Progress
        </h3>

        {/* Current Status Overview */}
        <div className="mb-6 rounded-none border-2 border-black bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            {getStatusIcon(user.onboardingStatus, true)}
            <div>
              <h4 className="text-lg font-bold text-black">Current Status</h4>
              <p
                className={`text-lg font-semibold ${getStatusColor(user.onboardingStatus, true)}`}
              >
                {user.onboardingStatus}
              </p>
            </div>
          </div>
          <p className="text-neutral-600">
            {getStatusDescription(user.onboardingStatus)}
          </p>

          {/* Progress Bar */}
          {!isDenied && !isInactive && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-neutral-600">Progress</span>
                <span className="font-semibold">
                  {Math.round(
                    ((currentStepIndex + 1) / onboardingSteps.length) * 100
                  )}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${((currentStepIndex + 1) / onboardingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Journey */}
        <div className="rounded-none border-2 border-black bg-white p-6">
          <h4 className="mb-4 text-lg font-bold text-black">
            Onboarding Journey
          </h4>
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => {
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="shrink-0">
                    {getStatusIcon(step, isCurrent)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${getStatusColor(step, isCurrent)}`}
                      >
                        {step}
                      </span>
                      {isCurrent && (
                        <span className="rounded bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
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
                  <span className="font-semibold text-danger">
                    Application Denied
                  </span>
                  <p className="mt-1 text-sm text-neutral-600">
                    The application was reviewed and denied by organizers
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Onboarding Details */}
        {user.onboardingProgress && (
          <div className="rounded-none border-2 border-black bg-white p-6">
            <h4 className="mb-4 text-lg font-bold text-black">
              Onboarding Details
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Masterclass Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-none ${
                    user.onboardingProgress.watchedMasterclass
                      ? 'bg-success/10'
                      : 'bg-neutral-100'
                  }`}
                >
                  <AcademicCapIcon
                    className={`size-5 ${
                      user.onboardingProgress.watchedMasterclass
                        ? 'text-success'
                        : 'text-neutral-400'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-600">
                    Masterclass
                  </p>
                  <p
                    className={`font-semibold ${
                      user.onboardingProgress.watchedMasterclass
                        ? 'text-success'
                        : 'text-neutral-500'
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
                  <div className="flex size-10 items-center justify-center rounded-none bg-primary/10">
                    <UserIcon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-600">
                      Selected Organizer
                    </p>
                    <p className="font-semibold text-black">
                      ID: {user.onboardingProgress.selectedOrganiserId}
                    </p>
                  </div>
                </div>
              )}

              {/* Onboarding Call */}
              {user.onboardingProgress.onboardingCallScheduledAt && (
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-none bg-warning/10">
                    <PhoneIcon className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-600">
                      Onboarding Call
                    </p>
                    <p className="font-semibold text-black">
                      {new Date(
                        user.onboardingProgress.onboardingCallScheduledAt
                      ).toLocaleDateString()}
                    </p>
                    {user.onboardingProgress.onboardingCallContactInfo && (
                      <p className="text-sm text-neutral-600">
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
                  <div className="flex size-10 items-center justify-center rounded-none bg-info/10">
                    <PhoneIcon className="size-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-600">
                      Revision Call
                    </p>
                    <p className="font-semibold text-black">
                      {new Date(
                        user.onboardingProgress.revisionCallScheduledAt
                      ).toLocaleDateString()}
                    </p>
                    {user.onboardingProgress.revisionCallContactInfo && (
                      <p className="text-sm text-neutral-600">
                        Contact:{' '}
                        {user.onboardingProgress.revisionCallContactInfo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onboarding Answers */}
        {user.onboardingAnswers && (
          <div className="rounded-none border-2 border-black bg-white p-6">
            <h4 className="mb-4 text-lg font-bold text-black">
              Application Answers
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Why are you vegan?
                </p>
                <p className="text-black">
                  {user.onboardingAnswers.veganReason}
                </p>
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
                  <p className="text-black">
                    {user.onboardingAnswers.customAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Date */}
        {user.joinDate && (
          <div className="rounded-none border-2 border-black bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-none bg-success/10">
                <CalendarIcon className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600">
                  Member Since
                </p>
                <p className="font-semibold text-black">
                  {new Date(user.joinDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-neutral-600">
                  {Math.floor(
                    (Date.now() - new Date(user.joinDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingProgressDetails;
