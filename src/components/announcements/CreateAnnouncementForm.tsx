import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useChapters } from '@/store';
import { useCurrentUser } from '@/store/auth.store';
import { AnnouncementScope, Chapter, Role } from '@/types';
import { getPostableScopes } from '@/utils';

interface CreateAnnouncementFormProps {
  onCreate: (data: {
    title: string;
    content: string;
    scope: AnnouncementScope;
    target?: string;
    ctaLink?: string;
    ctaText?: string;
  }) => void;
  onCancel: () => void;
}

const CreateAnnouncementForm: React.FC<CreateAnnouncementFormProps> = ({
  onCreate,
  onCancel,
}) => {
  const currentUser = useCurrentUser();
  const chapters = useChapters();

  const postableScopes = useMemo(
    () => (currentUser ? getPostableScopes(currentUser) : []),
    [currentUser]
  );

  const availableChapters = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.role === Role.CHAPTER_ORGANISER
      ? currentUser.organiserOf || []
      : chapters.map((c: Chapter) => c.name);
  }, [currentUser, chapters]);

  const availableCountries = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.role === Role.REGIONAL_ORGANISER
      ? [currentUser.managedCountry || '']
      : [...new Set(chapters.map((c: Chapter) => c.country))];
  }, [currentUser, chapters]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<AnnouncementScope>(
    postableScopes[0] || AnnouncementScope.GLOBAL
  );
  const [target, setTarget] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [ctaText, setCtaText] = useState('');

  useEffect(() => {
    if (scope === AnnouncementScope.CHAPTER) {
      setTarget(availableChapters[0] || '');
    } else if (scope === AnnouncementScope.REGIONAL) {
      setTarget(availableCountries[0] || '');
    } else {
      setTarget('');
    }
  }, [scope, availableChapters, availableCountries]);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (scope === AnnouncementScope.CHAPTER ||
        scope === AnnouncementScope.REGIONAL) &&
      !target
    ) {
      alert(`Please select a target ${scope.toLowerCase()}.`);
      return;
    }
    onCreate({ title, content, scope, target, ctaLink, ctaText });
  };

  return (
    <div className="max-w-3xl">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>

            <Separator className="my-6" />
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Optional: Call to Action
              </h2>
              <p className="text-sm text-muted-foreground">
                Add a link to encourage users to take action. The button will
                only appear if a link is provided.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="https://example.com/more-info"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaText">CTA Button Text</Label>
                  <Input
                    id="ctaText"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={scope}
                  onValueChange={(value) =>
                    setScope(value as AnnouncementScope)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {postableScopes.map((s: AnnouncementScope) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {scope === AnnouncementScope.REGIONAL && (
                <div className="space-y-2">
                  <Label htmlFor="target-region">Target Region</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map((r: string) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scope === AnnouncementScope.CHAPTER && (
                <div className="space-y-2">
                  <Label htmlFor="target-chapter">Target Chapter</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChapters.map((c: string) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" className="w-full">
                Publish Announcement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAnnouncementForm;
