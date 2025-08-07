import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "@/components/auth/Login";
import { useAuthActions } from "@/store/auth.store";
import { useUsers } from "@/store/data.store";
import { type User, OnboardingStatus } from "@/types";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();
  const users = useUsers();

  const handleLogin = (user: User) => {
    login(user);
    navigate("/dashboard");
  };

  const loginableUsers = users.filter(
    (u) =>
      u.onboardingStatus === OnboardingStatus.CONFIRMED ||
      u.onboardingStatus === OnboardingStatus.AWAITING_VERIFICATION
  );

  return <Login users={loginableUsers} onLogin={handleLogin} />;
};

export default LoginPage;
