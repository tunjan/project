import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { UsersIcon, UserGroupIcon, CheckIcon } from '@/icons';
import QRCode from 'qrcode.react';

const ChecklistItem: React.FC<{
  title: string;
  description: string;
  isComplete: boolean;
}> = ({ title, description, isComplete }) => (
  <div className="flex items-start">
    <div
      className={`mr-4 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-none border-2 border-black ${
        isComplete ? 'bg-primary text-white' : 'bg-white'
      }`}
    >
      {isComplete && <CheckIcon className="h-4 w-4" />}
    </div>
    <div>
      <h3 className="font-bold text-black">{title}</h3>
      <p className="text-neutral-600">{description}</p>
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

  const steps = [
    {
      title: 'Application Submitted',
      description: 'We have received your application for review.',
      isComplete: true, // Always complete once they are on this page
    },
    {
      title: 'Get Verified In-Person',
      description:
        'Find an organizer at an event to verify your identity. Show them the QR code below.',
      isComplete: status === OnboardingStatus.AWAITING_VERIFICATION,
    },
    {
      title: "Join a 'Welcome' call",
      description:
        'Once verified, you will be invited to a welcome call to get you up to speed.',
      isComplete: false, // This would be updated based on user data
    },
  ];

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
                <ChecklistItem
                  key={index}
                  title={step.title}
                  description={step.description}
                  isComplete={step.isComplete}
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
