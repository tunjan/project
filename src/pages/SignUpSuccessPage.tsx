import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  InstagramIcon,
} from '@/icons';
import { useChapterByName } from '@/store';

interface LocationState {
  name?: string;
  chapter?: string;
}

const SignUpSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { name, chapter } = (state || {}) as LocationState;
  const chapterData = useChapterByName(chapter);

  const instagramUrl = chapterData?.instagram
    ? chapterData.instagram.startsWith('http')
      ? chapterData.instagram
      : `https://instagram.com/${chapterData.instagram.replace(/^@/, '')}`
    : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="card-brutal card-padding bg-primary-lightest">
        <h1 className="h-card mb-2">
          Thanks for applying{name ? `, ${name}` : ''}!
        </h1>
        <p className="text-grey-700">
          We've received your application for{' '}
          {chapter ? <strong>{chapter}</strong> : 'your chapter'}.
        </p>
        <div className="rounded-nonenone mt-4 border-2 border-black bg-white p-4 shadow-brutal">
          <div className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-semibold">What happens next?</p>
              <ul className="text-grey-700 mt-1 list-disc pl-5 text-sm">
                <li>
                  An organizer from the {chapter || 'chapter'} team will review
                  your application.
                </li>
                <li>
                  Expect a decision in 3–5 days. You'll receive a notification
                  and email if enabled.
                </li>
                <li>
                  If approved, you'll be asked to get verified in person at your
                  next event.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            className="btn-primary flex items-center"
            onClick={() => navigate('/login')}
          >
            Continue to login
            <ChevronRightIcon className="ml-2 size-4" />
          </button>
          <button
            className="btn-primary flex items-center"
            onClick={() => navigate('/resources')}
          >
            Explore resources
            <ChevronRightIcon className="ml-2 size-4" />
          </button>
        </div>

        <div className="rounded-nonenone mt-6 border-2 border-black bg-white p-4 shadow-brutal">
          <p className="mb-2 font-semibold">Stay in the loop</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline"
              >
                <InstagramIcon className="size-4" /> Chapter Instagram
              </a>
            )}
            <span className="text-grey-600">·</span>
            <button
              className="inline-flex items-center gap-1 underline"
              onClick={() => navigate('/login')}
            >
              Contact organizers <ChatBubbleLeftRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpSuccessPage;
