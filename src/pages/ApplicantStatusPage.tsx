import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { CheckCircleIcon, ClockIcon, UsersIcon, UserGroupIcon } from '@/icons';
import QRCode from 'qrcode.react';

const StatusStep: React.FC<{
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}> = ({ title, description, isComplete, isActive }) => {
  const iconColor = isComplete
    ? 'bg-primary'
    : isActive
      ? 'bg-yellow-500'
      : 'bg-neutral-300';
  const textColor = isActive || isComplete ? 'text-black' : 'text-neutral-500';

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-none text-white ${iconColor}`}
        >
          {isComplete && <CheckCircleIcon className="h-5 w-5" />}
          {isActive && <ClockIcon className="h-5 w-5" />}
        </div>
        <div className="h-16 w-0.5 bg-neutral-300"></div>
      </div>
      <div className={`ml-4 pb-16 ${textColor}`}>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

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

  const steps = [
    {
      title: 'Application Submitted',
      description: 'We have received your application.',
      status: OnboardingStatus.PENDING_APPLICATION_REVIEW,
    },
    {
      title: 'Awaiting Verification',
      description:
        'Your application was approved! Find an organizer in person to get verified.',
      status: OnboardingStatus.AWAITING_VERIFICATION,
    },
    {
      title: 'Account Confirmed',
      description: 'Welcome to the movement! You now have full access.',
      status: OnboardingStatus.CONFIRMED,
    },
  ];

  const activeStepIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-2xl">
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
          <div className="border-2 border-red-500 bg-red-50 p-6 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-black">
              Application Not Approved
            </h2>
            <p className="mt-2 text-neutral-700">
              Unfortunately, your application to join has not been approved at
              this time. Please contact your local chapter organizer for more
              information.
            </p>
          </div>
        ) : (
          <div className="border-2 border-black bg-white p-6 md:p-8">
            <div>
              {steps.map((step, index) => (
                <StatusStep
                  key={step.title}
                  title={step.title}
                  description={step.description}
                  isComplete={activeStepIndex > index}
                  isActive={activeStepIndex === index}
                />
              ))}
            </div>

            {status === OnboardingStatus.AWAITING_VERIFICATION && (
              <div className="border-t-2 border-black pt-6">
                <h3 className="text-lg font-bold">Your Verification Code</h3>
                <p className="mb-4 mt-1 text-sm text-neutral-600">
                  Find a Chapter Organizer at an event and show them this QR
                  code. They will scan it to grant you full access to the
                  platform.
                </p>
                <div className="flex justify-center rounded-none border-2 border-black bg-white p-4">
                  <QRCode
                    value={`${window.location.origin}/verify/${currentUser.id}`}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            )}

            {status === OnboardingStatus.PENDING_APPLICATION_REVIEW && (
              <div className="border-t-2 border-black pt-6 text-center">
                <UserGroupIcon className="mx-auto h-10 w-10 text-neutral-400" />
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
