import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import UserProfile from '@/components/profile/UserProfile'; // Use the consolidated component
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserById, useUsersActions, useUsersState } from '@/store';

const ViewProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const user = useUserById(userId);
  const allUsers = useUsersState();
  const { init, clearPersistedData } = useUsersActions();
  const [showResetButton, setShowResetButton] = useState(false);

  // Initialize store when component mounts
  useEffect(() => {
    init();
  }, [init]);

  // Show reset button after 5 seconds if still loading
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setShowResetButton(true), 5000);
      return () => clearTimeout(timer);
    }
    setShowResetButton(false);
  }, [user]);

  const handleResetStore = () => {
    clearPersistedData();
    window.location.reload();
  };

  // Debug logging

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

  // The page now simply renders the consolidated UserProfile with the fetched user
  return <UserProfile user={user} />;
};

export default ViewProfilePage;
