import { Calendar, ChevronRight, Instagram, MessageCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChapterByName } from '@/store';

interface LocationState {
  name?: string;
  chapter?: string;
}

const SignUpSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { name, chapter } = (state || {}) as LocationState;
  const allChapters = useChapterByName(chapter);
  const chapterData = useMemo(() => {
    if (!chapter || !allChapters.length) return undefined;
    return allChapters.find(
      (c) => c.name.toLowerCase() === chapter.toLowerCase()
    );
  }, [allChapters, chapter]);

  const instagramUrl = chapterData?.instagram
    ? chapterData.instagram.startsWith('http')
      ? chapterData.instagram
      : `https://instagram.com/${chapterData.instagram.replace(/^@/, '')}`
    : undefined;

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Thanks for applying{name ? `, ${name}` : ''}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We've received your application for{' '}
            {chapter ? <strong>{chapter}</strong> : 'your chapter'}.
          </p>
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-semibold">What happens next?</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                    <li>
                      An organizer from the {chapter || 'chapter'} team will
                      review your application.
                    </li>
                    <li>
                      Expect a decision in 3–5 days. You'll receive a
                      notification and email if enabled.
                    </li>
                    <li>
                      If approved, you'll be asked to get verified in person at
                      your next event.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => navigate('/login')}>
              Continue to login
              <ChevronRight className="ml-2 size-4" />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/resources')}>
              Explore resources
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>

          <Card className="mt-6">
            <CardContent className="p-4">
              <p className="mb-2 font-semibold">Stay in the loop</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {instagramUrl && (
                  <Button
                    variant="link"
                    asChild
                    className="inline-flex items-center gap-1 p-0"
                  >
                    <a href={instagramUrl} target="_blank" rel="noreferrer">
                      <Instagram className="size-4" /> Chapter Instagram
                    </a>
                  </Button>
                )}
                <span className="text-muted-foreground">·</span>
                <Button
                  variant="link"
                  className="inline-flex items-center gap-1 p-0"
                  onClick={() => navigate('/login')}
                >
                  Contact organizers <MessageCircle className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpSuccessPage;
