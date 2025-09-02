import { ISSUES_URL } from '@/config';
import { ChatBubbleLeftRightIcon } from '@/icons';

const FeedbackButton: React.FC = () => {
  const href = ISSUES_URL;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Report a bug or suggest an improvement"
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[4px_4px_0_#000] transition-colors hover:bg-primary-lightest md:border-2"
    >
      <ChatBubbleLeftRightIcon className="size-4" />
      <span>Feedback</span>
    </a>
  );
};

export default FeedbackButton;
