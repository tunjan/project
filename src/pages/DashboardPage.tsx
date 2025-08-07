import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { useCurrentUser } from "@/store/auth.store";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <Dashboard user={currentUser} />;
};

export default DashboardPage;
