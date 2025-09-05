import {
  Box as Cube,
  Calendar,
  Check,
  Clock,
  Video,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/store/auth.store';
import { OnboardingStatus } from '@/types';
import { cn } from '@/utils';

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
        className={cn(
          'absolute left-6 top-12 h-16 w-0.5',
          isComplete ? 'bg-primary' : 'bg-border'
        )}
      />
    )}

    <div className="flex items-start space-x-4">
      {/* Step indicator */}
      <div
        className={cn(
          'relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2',
          isComplete
            ? 'border-primary bg-primary text-primary-foreground'
            : isActive
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background'
        )}
      >
        {isComplete ? (
          <Check className="size-6" />
        ) : (
          <span className="text-sm font-bold">{stepNumber}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-muted-foreground">{description}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">
            Your Application Status
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome, {currentUser.name}! Here's the current status of your
            application.
          </p>
        </div>

        {isDenied ? (
          <Card className="p-6 text-center">
            <XCircle className="mx-auto mb-4 size-12 text-destructive" />
            <h2 className="mb-4 text-xl font-semibold">
              Application Not Approved
            </h2>
            <p className="mb-6 text-muted-foreground">
              Unfortunately, your application to join has not been approved at
              this time. Please contact your local chapter organizer for more
              information.
            </p>
            <Button variant="destructive">CONTACT ORGANIZER</Button>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <CardTitle
                className={cn(
                  'inline-block rounded-md px-4 py-2 text-sm font-bold',
                  statusInfo.type === 'success'
                    ? 'text-success-foreground bg-success'
                    : 'text-info-foreground bg-info'
                )}
              >
                {statusInfo.title.toUpperCase()}
              </CardTitle>
              <p className="pt-4 text-muted-foreground">{statusInfo.message}</p>
            </CardHeader>
            <CardContent>
              {/* Action Buttons */}
              <div className="my-6 space-y-3 border-y py-6">
                {status === OnboardingStatus.PENDING_ONBOARDING_CALL && (
                  <Button asChild className="w-full">
                    <Link to="/dashboard">
                      <Calendar className="mr-2 size-5" />
                      Schedule Onboarding Call
                    </Link>
                  </Button>
                )}
                {status === OnboardingStatus.AWAITING_FIRST_CUBE && (
                  <Button asChild className="w-full">
                    <Link to="/cubes">
                      <Cube className="mr-2 size-5" />
                      Find a Cube to Attend
                    </Link>
                  </Button>
                )}
                {status === OnboardingStatus.AWAITING_MASTERCLASS && (
                  <Button asChild className="w-full">
                    <Link to="/dashboard">
                      <Video className="mr-2 size-5" />
                      Confirm Masterclass Watched
                    </Link>
                  </Button>
                )}
                {status === OnboardingStatus.AWAITING_REVISION_CALL && (
                  <Button asChild className="w-full">
                    <Link to="/dashboard">
                      <Calendar className="mr-2 size-5" />
                      Schedule Revision Call
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/resources">Browse Learning Resources</Link>
                </Button>
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

              {/* Waiting State */}
              {status === OnboardingStatus.PENDING_APPLICATION_REVIEW && (
                <div className="border-t pt-6 text-center">
                  <Clock className="mx-auto size-10 text-muted-foreground" />
                  <h3 className="mt-2 font-semibold">Patience is a virtue!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    An organizer from your chapter is reviewing your
                    application. You will receive a notification here once it's
                    been approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicantStatusPage;
