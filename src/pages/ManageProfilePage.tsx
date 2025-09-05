import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MemberProfile from '@/components/management/MemberProfile';
import { Button } from '@/components/ui/button';
import { useUsers, useUsersStore } from '@/store';

const ManageProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const users = useUsers();
  const [showResetButton, setShowResetButton] = useState(false);
  const user = users.find((u) => u.id === userId);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setShowResetButton(true), 5000);
      return () => clearTimeout(timer);
    }
    setShowResetButton(false);
  }, [user]);

  const handleResetStore = () => {
    useUsersStore.getState().clearPersistedData();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-4 text-center text-muted-foreground">
            Loading user profile...
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            User ID: {userId} | Total users: {users.length}
          </p>

          {/* Add a button to reset store data if loading takes too long */}
          {showResetButton && (
            <Button
              onClick={handleResetStore}
              variant="destructive"
              size="sm"
              className="mt-4"
            >
              Reset Store Data
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <MemberProfile user={user} onBack={() => navigate('/manage')} />;
};

export default ManageProfilePage;
