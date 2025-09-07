import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ISSUES_URL } from '@/config';

const FeedbackButton: React.FC = () => {
  const href = ISSUES_URL;
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-40"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Report a bug or suggest an improvement"
      >
        <MessageCircle className="mr-2 size-4" />
        Feedback
      </a>
    </Button>
  );
};

export default FeedbackButton;
