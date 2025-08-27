import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { CheckIcon, ClockIcon, XCircleIcon } from '@/icons';
import QRCode from 'qrcode.react';

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
          isComplete ? 'bg-black' : 'bg-white'
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
        <p className="text-grey-600 mt-1">{description}</p>

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
      case OnboardingStatus.AWAITING_VERIFICATION:
        return 2;
      default:
        return 1;
    }
  };

  const currentStep = getCurrentStep();

  const steps = [
    {
      title: 'Application Submitted',
      description:
        "We have received your application and it's being reviewed by our team.",
    },
    {
      title: 'Get Verified In-Person',
      description:
        'Meet with a chapter organizer at an event to verify your identity and commitment.',
    },
    {
      title: 'Welcome & Onboarding',
      description:
        'Join a welcome session to learn about our community and get started.',
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
            'Your application is being carefully reviewed by our chapter organizers.',
          type: 'info' as const,
        };
      case OnboardingStatus.AWAITING_VERIFICATION:
        return {
          title: 'Ready for Verification',
          message:
            'Your application has been approved! Now you need to verify your identity in person.',
          type: 'success' as const,
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
          <p className="text-grey-600 mt-2">
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
            <p className="text-grey-600 mb-6">
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
              <p className="text-grey-600 mt-4">{statusInfo.message}</p>
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

            {/* QR Code Section */}
            {status === OnboardingStatus.AWAITING_VERIFICATION && (
              <div className="border-t-2 border-black pt-6">
                <h3 className="text-lg font-bold text-black">
                  Your Verification Code
                </h3>
                <p className="text-grey-600 mb-4 mt-1 text-sm">
                  Find a Chapter Organizer at an event and show them this QR
                  code. They will scan it to grant you full access to the
                  platform.
                </p>
                <div className="flex justify-center border-2 border-black bg-white p-4">
                  <QRCode
                    value={`${window.location.origin}/verify/${currentUser.id}`}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            )}

            {/* Waiting State */}
            {status === OnboardingStatus.PENDING_APPLICATION_REVIEW && (
              <div className="border-t-2 border-black pt-6 text-center">
                <ClockIcon className="text-grey-500 mx-auto h-10 w-10" />
                <h3 className="mt-2 font-bold text-black">
                  Patience is a virtue!
                </h3>
                <p className="text-grey-600 mt-1 text-sm">
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
