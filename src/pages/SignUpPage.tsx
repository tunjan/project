import React from "react";
import { useNavigate } from "react-router-dom";
import SignUp from "@/components/auth/SignUp";
import { useChapters, useDataActions } from "@/store/data.store";
import { type OnboardingAnswers } from "@/types";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useDataActions();
  const chapters = useChapters();

  const handleRegister = (formData: {
    name: string;
    instagram: string;
    chapter: string;
    answers: OnboardingAnswers;
  }) => {
    register(formData);

    alert("Registration submitted! An organizer will review your application.");
    navigate("/login");
  };

  return (
    <SignUp
      chapters={chapters}
      onRegister={handleRegister}
      onNavigateLogin={() => navigate("/login")}
    />
  );
};

export default SignUpPage;
