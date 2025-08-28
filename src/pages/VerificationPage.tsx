import React from 'react';

// Deprecated: The QR/manual verification flow has been removed.
// This page remains to avoid broken routes and informs users about the new process.
const VerificationPage: React.FC = () => {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-xl border-2 border-black bg-white p-8 text-center shadow-brutal">
        <h1 className="text-2xl font-extrabold text-black">Verification Flow Updated</h1>
        <p className="mt-4 text-sm text-black">
          The identity verification via QR code has been deprecated. Onboarding now progresses through the new multi-stage pipeline
          (Application Review, Onboarding Call, First Cube, Masterclass, Revision Call).
        </p>
        <p className="mt-2 text-sm text-black">
          Please manage confirmations via the Management page’s Onboarding Pipeline or the member’s profile actions.
        </p>
        <a href="/manage" className="btn-primary mt-6 inline-block">Go to Management</a>
      </div>
    </div>
  );
};

export default VerificationPage;
