import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { CheckIcon, ClockIcon, XCircleIcon } from '@/icons';

const ProgressStep: React.FC<{
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  stepNumber: number;
  totalSteps: number;
}> = ({ title, description, isComplete, isActive, stepNumber, totalSteps }) => (
  <div className="relative">
    {/* Connection line */}
    {stepNumber < totalSteps && (
      <div
        className={`absolute left-6 top-12 h-16 w-0.5 ${
          isComplete ? 'bg-black' : 'bg-neutral-200'
        }`}
      />
    )}

    <div className="flex items-start space-x-4">
      {/* Step indicator */}
      <div
        className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black ${
          isComplete
            ? 'bg-black text-white'
            : isActive
              ? 'bg-primary text-white'
              : 'bg-white text-black'
        }`}
      >
        {isComplete ? (
          <CheckIcon className="h-6 w-6" />
        ) : (
          <span className="text-sm font-bold">{stepNumber}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className="text-lg font-bold text-black">{title}</h3>
        <p className="mt-1 text-neutral-600">{description}</p>

        {/* Status badge */}
        {isComplete && (
          <div className="mt-2 inline-block border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black">
            COMPLETED
          </div>
        )}
        {isActive && !isComplete && (
          <div className="mt-2 inline-block border-2 border-primary bg-primary px-3 py-1 text-xs font-bold text-white">
            IN PROGRESS
          </div>
        )}
      </div>
    </div>
  </div>
);

const ApplicantStatusPage: React.FC = () => {
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.onboardingStatus === OnboardingStatus.CONFIRMED) {
    return <Navigate to="/dashboard" replace />;
  }

  const status = currentUser.onboardingStatus;
  const isDenied = status === OnboardingStatus.DENIED;

  // Determine which step is currently active based on status
  const getCurrentStep = () => {
    switch (status) {
      case OnboardingStatus.PENDING_APPLICATION_REVIEW:
        return 1;
      case OnboardingStatus.PENDING_ONBOARDING_CALL:
        return 2;
      case OnboardingStatus.AWAITING_FIRST_CUBE:
        return 3;
      case OnboardingStatus.AWAITING_MASTERCLASS:
        return 4;
      case OnboardingStatus.AWAITING_REVISION_CALL:
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      title: 'Application Submitted',
      description:
        "We've received your application. An organizer will review it soon.",
    },
    {
      title: 'Onboarding Call',
      description:
        'Schedule and attend your onboarding call to go over expectations and next steps.',
    },
    {
      title: 'Attend First Cube',
      description:
        'Join your chapter at a Cube. This helps you get familiar with our outreach style.',
    },
    {
      title: 'Watch Masterclass',
      description:
        'Complete the required masterclass to deepen your understanding.',
    },
    {
      title: 'Revision Call',
      description:
        'Wrap up with a revision call to confirm your readiness to be fully confirmed.',
    },
  ].map((step, index) => {
    const stepNumber = index + 1;
    return {
      ...step,
      isComplete: currentStep > stepNumber,
      isActive: currentStep === stepNumber,
    };
  });

  const getStatusMessage = () => {
    switch (status) {
      case OnboardingStatus.PENDING_APPLICATION_REVIEW:
        return {
          title: 'Application Under Review',
          message:
            'Your application is being reviewed by our organizers. You will be notified once a decision is made.',
          type: 'info' as const,
        };
      case OnboardingStatus.PENDING_ONBOARDING_CALL:
        return {
          title: 'Schedule Your Onboarding Call',
          message:
            'Your application was approved! Please schedule and complete your onboarding call.',
          type: 'success' as const,
        };
      case OnboardingStatus.AWAITING_FIRST_CUBE:
        return {
          title: 'Attend Your First Cube',
          message:
            'Great progress! Join your chapter at an upcoming Cube event.',
          type: 'info' as const,
        };
      case OnboardingStatus.AWAITING_MASTERCLASS:
        return {
          title: 'Watch the Masterclass',
          message:
            'Complete the masterclass to deepen your understanding before finalizing.',
          type: 'info' as const,
        };
        break;
      case OnboardingStatus.AWAITING_REVISION_CALL:
        return {
          title: 'Final Revision Call',
          message:
            'Schedule and complete your revision call to finalize your onboarding.',
          type: 'info' as const,
        };
      default:
        return {
          title: 'Application Status',
          message: "We're processing your application.",
          type: 'info' as const,
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-black">
            Your Application Status
          </h1>
          <p className="mt-2 text-neutral-600">
            Welcome, {currentUser.name}! Here's the current status of your
            application.
          </p>
        </div>

        {isDenied ? (
          <div className="border-2 border-black bg-white p-6 text-center">
            <XCircleIcon className="mx-auto mb-4 h-12 w-12 text-black" />
            <h2 className="mb-4 text-xl font-bold text-black">
              Application Not Approved
            </h2>
            <p className="mb-6 text-neutral-600">
              Unfortunately, your application to join has not been approved at
              this time. Please contact your local chapter organizer for more
              information.
            </p>
            <button className="border-2 border-black bg-black px-6 py-2 font-bold text-white transition-colors hover:bg-white hover:text-black">
              CONTACT ORGANIZER
            </button>
          </div>
        ) : (
          <div className="border-2 border-black bg-white p-6 md:p-8">
            {/* Status Message */}
            <div className="mb-8 text-center">
              <div
                className={`inline-block border-2 px-4 py-2 font-bold ${
                  statusInfo.type === 'success'
                    ? 'border-black bg-black text-white'
                    : 'border-primary bg-primary text-white'
                }`}
              >
                {statusInfo.title.toUpperCase()}
              </div>
              <p className="mt-4 text-neutral-600">{statusInfo.message}</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-0">
              {steps.map((step, index) => (
                <ProgressStep
                  key={index}
                  title={step.title}
                  description={step.description}
                  isComplete={step.isComplete}
                  isActive={step.isActive}
                  stepNumber={index + 1}
                  totalSteps={steps.length}
                />
              ))}
            </div>

            {/* QR code flow deprecated */}

            {/* Waiting State */}
            {status === OnboardingStatus.PENDING_APPLICATION_REVIEW && (
              <div className="border-t-2 border-black pt-6 text-center">
                <ClockIcon className="mx-auto h-10 w-10 text-neutral-500" />
                <h3 className="mt-2 font-bold text-black">
                  Patience is a virtue!
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  An organizer from your chapter is reviewing your application.
                  You will receive a notification here once it's been approved.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantStatusPage;
