import React, { useState, useEffect, useMemo } from 'react';
import { AnnouncementScope, Role, Chapter } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useChapters } from '@/store';
import { getPostableScopes } from '@/utils/auth';
import { InputField, TextAreaField, SelectField } from '@/components/ui/Form';

interface CreateAnnouncementFormProps {
  onCreate: (data: {
    title: string;
    content: string;
    scope: AnnouncementScope;
    target?: string;
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
    onCreate({ title, content, scope, target });
  };

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-3xl border-2 border-black bg-white">
        <div className="border-b-2 border-black p-8">
          <h1 className="text-3xl font-extrabold text-black">
            Create Announcement
          </h1>
          <p className="text-grey-600 mt-2">
            Your message will be visible to the audience defined by the selected
            scope.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <InputField
            label="Title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextAreaField
            label="Content"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SelectField
              label="Scope"
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as AnnouncementScope)}
            >
              {postableScopes.map((s: AnnouncementScope) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>

            {scope === AnnouncementScope.REGIONAL && (
              <SelectField
                label="Target Region"
                id="target-region"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={currentUser.role === Role.REGIONAL_ORGANISER}
              >
                <option value="">Select Region</option>
                {availableCountries.map((r: string) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </SelectField>
            )}
            {scope === AnnouncementScope.CHAPTER && (
              <SelectField
                label="Target Chapter"
                id="target-chapter"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">Select Chapter</option>
                {availableChapters.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
            )}
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-black px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-primary px-4 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary-hover"
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementForm;
