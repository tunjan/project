import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignUp from '@/components/auth/SignUp';
import { useChapters, useUsersActions } from '@/store';
import { type OnboardingAnswers } from '@/types';
import { toast } from 'sonner';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { register } = useUsersActions();
  const chapters = useChapters();

  const chapterFromState = (state as { chapter?: string })?.chapter;

  const handleRegister = (formData: {
    name: string;
    email: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => {
    register(formData);

    toast.info('Registration submitted!', {
      description: 'An organizer will review your application shortly.',
    });
    navigate('/signup-success', {
      state: { name: formData.name, chapter: formData.chapter },
    });
  };

  return (
    <SignUp
      chapters={chapters}
      onRegister={handleRegister}
      onNavigateLogin={() => navigate('/login')}
      defaultChapter={chapterFromState}
    />
  );
};

export default SignUpPage;
