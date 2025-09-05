import { Mail, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type User } from '@/types';
import { copyToClipboard } from '@/utils';

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
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:text-left">
          <Link
            to={`/members/${user.id}`}
            className="flex flex-1 flex-col items-center gap-6 sm:flex-row sm:text-left"
          >
            <Avatar className="size-24 shrink-0">
              <AvatarImage src={user.profilePictureUrl} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <ShieldCheck className="size-6 text-primary" />
                <h3 className="text-xl font-extrabold text-foreground">
                  Regional Organiser
                </h3>
              </div>
              <p className="text-2xl font-bold text-foreground">{user.name}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                <Mail className="size-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </Link>

          {/* Separate button for copying email */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyEmail}
            title="Copy email to clipboard"
            aria-label="Copy email to clipboard"
          >
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalOrganiserCard;
