import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import UserProfile from '@/components/profile/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserById, useUsersState, useUsersStore } from '@/store';

const ViewProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const allUsers = useUsersState();
  const user = useUserById(userId);
  const [showResetButton, setShowResetButton] = useState(false);

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex min-h-[50vh] w-full items-center justify-center">
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-4 text-foreground">Loading profile...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  User ID: {userId} | Total users: {allUsers.length}
                </p>

                {/* Add a button to reset store data if loading takes too long */}
                {showResetButton && (
                  <Button
                    onClick={handleResetStore}
                    variant="destructive"
                    className="mt-4"
                  >
                    Reset Store Data
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return <UserProfile user={user} />;
};

export default ViewProfilePage;
