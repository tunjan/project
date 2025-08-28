import React from 'react';
import { Link } from 'react-router-dom';
import { type User } from '@/types';
import { MailIcon, ShieldCheckIcon } from '@/icons';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { toast } from 'sonner';

interface RegionalOrganiserCardProps {
  user: User;
}

const RegionalOrganiserCard: React.FC<RegionalOrganiserCardProps> = ({
  user,
}) => {
  const handleCopyEmail: React.MouseEventHandler<HTMLButtonElement> = async (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await copyToClipboard(user.email);
      toast.success('Email copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy email');
    }
  };

  return (
    <Link
      to={`/members/${user.id}`}
      className="card-brutal-hover mb-8 flex w-full flex-col items-center gap-6 bg-primary-lightest p-6 text-center shadow-brutal sm:flex-row sm:text-left"
    >
      <img
        src={user.profilePictureUrl}
        alt={user.name}
        className="h-24 w-24 flex-shrink-0 border-2 border-black object-cover"
      />
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
          <ShieldCheckIcon className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-extrabold text-black">
            Regional Organiser
          </h3>
        </div>
        <p className="text-2xl font-bold">{user.name}</p>
        <div className="mt-2 flex items-center justify-center gap-2 text-neutral-600 sm:justify-start">
          <MailIcon className="h-4 w-4" />
          <span className="text-sm">{user.email}</span>
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Copy email to clipboard"
            className="ml-2 rounded-none border-2 border-black bg-white px-2 py-0.5 text-xs font-bold text-black transition-colors hover:bg-neutral-100"
            aria-label="Copy email to clipboard"
          >
            Copy
          </button>
        </div>
      </div>
    </Link>
  );
};

export default RegionalOrganiserCard;
