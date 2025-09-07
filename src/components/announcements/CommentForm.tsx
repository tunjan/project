import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type User } from '@/types';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  currentUser: User;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  currentUser,
  placeholder = 'Write a comment...',
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage
          src={currentUser.profilePictureUrl}
          alt={currentUser.name}
          className="object-cover"
        />
        <AvatarFallback className="text-xs">
          {currentUser.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[80px] resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim()}
            className="gap-2"
          >
            <Send className="size-4" />
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
